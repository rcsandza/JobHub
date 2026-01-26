import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { formatDistance } from 'date-fns';
import { supabase } from '../lib/supabase';
import { usePageTracking } from '../hooks/usePageTracking';
import { trackButtonClick } from '../lib/tracking';
import { JobDetailSkeleton } from './JobDetailSkeleton';
import { TopBar } from './TopBar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ApplicationForm } from './ApplicationForm';
import { PayloadModal } from './PayloadModal';
import { SuccessModal } from './SuccessModal';
import { Banknote, MapPin, Building2, CalendarClock, ChevronRight } from 'lucide-react';

interface Job {
  id: string;
  referencenumber: string | null;
  title: string;
  company: string;
  company_url: string | null;
  job_url: string | null;
  postal_code: string | null;
  description_html: string | null;
  posted_at: string | null;
  apply_post_url: string | null;
  is_active: boolean | null;
  last_seen_at: string | null;
  extra: any;
  created_at: string;
  updated_at: string;
  company_id: string | null;
  location_id: string | null;
  slug: string | null;
  employment_type: string | null;
  compensation_min: number | null;
  compensation_max: number | null;
  target_wage_rate: number | null;
  target_wage_rate_max: number | null;
  publisher: string | null;
  publisher_url: string | null;
  last_build_date: string | null;
  job_count: number | null;
  notes: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  schedule_days: string | null;
  schedule_times: string | null;
  profile_url: string | null;
  job_request_url: string | null;
}

export function JobDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = params['*'] || '';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payload, setPayload] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Job context for tracking
  const jobContext = job ? {
    jobId: job.id,
    jobSlug: slug,
    jobReferenceNumber: job.referencenumber || undefined,
    jobTitle: job.title,
    jobCompany: job.company,
  } : undefined;

  // Track page view when job is loaded
  usePageTracking('Job Detail Page', jobContext, !!job && !loading);

  const handleApplicationSubmit = (applicationPayload: any) => {
    trackButtonClick('Submit Application', jobContext, {
      hasResume: !!applicationPayload.hiring_applicant?.resume,
    });
    setPayload(applicationPayload);
    setIsModalOpen(true);
  };

  const handlePayloadClose = () => {
    setIsModalOpen(false);

    // Check if desktop (>= 1024px)
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      // Show success modal on desktop
      setIsSuccessModalOpen(true);
    } else {
      // On mobile: save to session storage before navigating
      if (job?.id) {
        sessionStorage.setItem(`applied_${job.id}`, 'true');
        setHasApplied(true);
      }

      // Navigate to success page on mobile (replace history so back button skips success page)
      navigate('/success', {
        replace: true,
        state: {
          applicantName: payload?.hiring_applicant?.first_name || 'Applicant',
          jobTitle: job?.title || '',
          companyName: job?.company || '',
          jobUrl: job?.job_url || undefined,
          companyUrl: job?.company_url || undefined,
          jobSlug: slug,
        },
      });
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);

    // Store in session storage that user has applied to this job
    if (job?.id) {
      sessionStorage.setItem(`applied_${job.id}`, 'true');
      setHasApplied(true);
    }
  };

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Job not found');
          } else {
            console.error('Error fetching job:', fetchError);
            setError('Failed to load job details. Please try again.');
          }
          return;
        }

        setJob(data);
        console.log('Job data loaded:', {
          title: data.title,
          compensation_min: data.compensation_min,
          compensation_max: data.compensation_max,
          employment_type: data.employment_type,
          schedule_days: data.schedule_days,
          schedule_times: data.schedule_times,
        });

        // Check if user has already applied to this job
        const appliedStatus = sessionStorage.getItem(`applied_${data.id}`);
        if (appliedStatus === 'true') {
          setHasApplied(true);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [slug]);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Job not found'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Format posted date
  const postedDate = job.posted_at
    ? formatDistance(new Date(job.posted_at), new Date(), { addSuffix: true })
    : null;

  // Check if new (within last 7 days)
  const isNew =
    job.posted_at &&
    new Date().getTime() - new Date(job.posted_at).getTime() <
      7 * 24 * 60 * 60 * 1000;

  // Format wage range
  const formatWage = () => {
    // Use compensation_min/max first, fallback to target_wage_rate for backwards compatibility
    const minWage = job.compensation_min ?? job.target_wage_rate;
    const maxWage = job.compensation_max ?? job.target_wage_rate_max;

    if (!minWage) {
      return 'Competitive salary';
    }

    // Determine if yearly salary (>= $1000) or hourly rate
    const isYearly = minWage >= 1000;
    const suffix = isYearly ? 'per year' : 'per hour';

    // Format number with commas for yearly salaries
    const formatNumber = (num: number) => {
      return isYearly ? num.toLocaleString('en-US') : num.toString();
    };

    if (minWage && maxWage) {
      return `$${formatNumber(minWage)} - $${formatNumber(maxWage)} ${suffix}`;
    } else {
      return `$${formatNumber(minWage)}+ ${suffix}`;
    }
  };

  const wageRange = formatWage();

  // Format wage with employment type
  const wageWithType = `${wageRange} • ${job.employment_type || 'Full-time'}`;

  // Get shift preference from extra data or use schedule fields
  const shiftPreference = job.schedule_times || job.extra?.shift_preference || 'Flexible schedule';

  // Format Google Maps URL from address
  const getGoogleMapsUrl = () => {
    if (!job.address) return null;
    const encodedAddress = encodeURIComponent(job.address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const mapsUrl = getGoogleMapsUrl();

  // Format full address
  const formatAddress = () => {
    // Use address column if available
    if (job.address) {
      return job.address;
    }

    // Build address from available fields
    const parts = [];
    if (job.extra?.street_address) {
      parts.push(job.extra.street_address);
    }

    // City, State ZIP on one line
    const cityStateLine = [
      job.extra?.city,
      job.extra?.state,
      job.postal_code
    ].filter(Boolean).join(', ');

    if (cityStateLine) {
      parts.push(cityStateLine);
    } else if (job.postal_code) {
      // If we only have ZIP, show it
      parts.push(job.postal_code);
    }

    return parts.filter(Boolean).join('\n') || 'Location not specified';
  };

  const address = formatAddress();
  const addressLines = address.split('\n');

  // Sanitize HTML description
  const sanitizedDescription = job.description_html
    ? DOMPurify.sanitize(job.description_html)
    : null;

  const scrollToApplication = () => {
    const formElement = document.getElementById('application-form');
    if (formElement) {
      // Get the position of the form element
      const elementPosition = formElement.getBoundingClientRect().top + window.pageYOffset;
      // Offset for TopBar (64px height) + some padding (16px) so "Apply to this job" header is visible
      const offsetPosition = elementPosition - 80;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <TopBar jobTitle={job?.title} />

      {/* Grey background for all cards */}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto w-full max-w-[800px] pt-4 pb-4 md:py-5 px-4 md:px-6">

          {/* Mobile Job Summary Card - Figma Design */}
          <div className="lg:hidden bg-card rounded-lg border border-border mb-4" style={{ padding: '20px 16px' }}>
            <div className="flex flex-col gap-5">
              {/* New Badge */}
              {isNew && (
                <div>
                  <svg width="51" height="26" viewBox="0 0 51 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="51" height="26" rx="13" fill="#F1ECFF"/>
                    <path d="M12.864 18V9.06H14.136L19.056 15.684L18.396 15.816V9.06H20.028V18H18.744L13.896 11.328L14.496 11.196V18H12.864ZM24.7225 18.144C24.0505 18.144 23.4625 17.992 22.9585 17.688C22.4545 17.384 22.0625 16.972 21.7825 16.452C21.5025 15.932 21.3625 15.356 21.3625 14.724C21.3625 14.068 21.5025 13.488 21.7825 12.984C22.0705 12.472 22.4585 12.068 22.9465 11.772C23.4425 11.476 23.9945 11.328 24.6025 11.328C25.1145 11.328 25.5625 11.412 25.9465 11.58C26.3385 11.748 26.6705 11.98 26.9425 12.276C27.2145 12.572 27.4225 12.912 27.5665 13.296C27.7105 13.672 27.7825 14.08 27.7825 14.52C27.7825 14.632 27.7745 14.748 27.7585 14.868C27.7505 14.988 27.7305 15.092 27.6985 15.18H22.6585V13.98H26.8105L26.0665 14.544C26.1385 14.176 26.1185 13.848 26.0065 13.56C25.9025 13.272 25.7265 13.044 25.4785 12.876C25.2385 12.708 24.9465 12.624 24.6025 12.624C24.2745 12.624 23.9825 12.708 23.7265 12.876C23.4705 13.036 23.2745 13.276 23.1385 13.596C23.0105 13.908 22.9625 14.288 22.9945 14.736C22.9625 15.136 23.0145 15.492 23.1505 15.804C23.2945 16.108 23.5025 16.344 23.7745 16.512C24.0545 16.68 24.3745 16.764 24.7345 16.764C25.0945 16.764 25.3985 16.688 25.6465 16.536C25.9025 16.384 26.1025 16.18 26.2465 15.924L27.5185 16.548C27.3905 16.86 27.1905 17.136 26.9185 17.376C26.6465 17.616 26.3225 17.804 25.9465 17.94C25.5785 18.076 25.1705 18.144 24.7225 18.144ZM30.6182 18L28.3742 11.472H30.0302L31.6742 16.428L31.0982 16.416L32.8502 11.472H34.2422L35.9822 16.416L35.4062 16.428L37.0502 11.472H38.7062L36.4622 18H35.0582L33.2822 12.828H33.8102L32.0102 18H30.6182Z" fill="#7E3DD4"/>
                  </svg>
                </div>
              )}

              {/* Title, Company, Posted Date */}
              <div className="flex flex-col gap-2">
                <h1 className="text-foreground font-bold leading-tight" style={{ fontSize: '22px', lineHeight: '1.4545em', letterSpacing: '0.01em' }}>
                  {job.title}
                </h1>
                <a
                  href={job.company_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity"
                  style={{ fontSize: '16px', lineHeight: '1.4375em' }}
                >
                  {job.company}
                  <ChevronRight className="h-4 w-4" />
                </a>
                {postedDate && (
                  <p style={{ fontSize: '14px', lineHeight: '1.7142em', color: '#605F56', fontWeight: 500 }}>
                    Posted {postedDate}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t" style={{ borderColor: '#E6E4D6', borderWidth: '1.5px' }}></div>

              {/* Details Section */}
              <div className="flex flex-col gap-5">
                {/* Wage */}
                <div className="flex items-center gap-4">
                  <Banknote className="h-6 w-6 text-foreground flex-shrink-0" />
                  <p className="text-foreground font-medium" style={{ fontSize: '16px', lineHeight: '1.5em' }}>
                    {wageRange}
                  </p>
                </div>

                {/* Shift Time */}
                <div className="flex items-center gap-4">
                  <CalendarClock className="h-6 w-6 text-foreground flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-foreground font-medium" style={{ fontSize: '16px', lineHeight: '1.5em' }}>
                      {job.employment_type || 'Full-time'}{job.schedule_days && ` • ${job.schedule_days}`}
                    </p>
                    {job.schedule_times && (
                      <p className="font-medium" style={{ fontSize: '16px', lineHeight: '1.5em', color: '#605F56' }}>
                        {job.schedule_times}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-4">
                  <MapPin className="h-5.5 w-5.5 text-foreground flex-shrink-0" />
                  <div className="text-foreground font-medium" style={{ fontSize: '16px', lineHeight: '1.5em' }}>
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80 transition-opacity"
                      >
                        {addressLines.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </a>
                    ) : (
                      <>
                        {addressLines.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Apply Button */}
              <div>
                {hasApplied ? (
                  <Button
                    disabled
                    className="w-full cursor-not-allowed rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: '#F2F2EC',
                      color: '#605F56',
                      textAlign: 'center',
                      fontFamily: '"Plus Jakarta Sans"',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '24px',
                      padding: '12px 24px',
                      gap: '8px',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.6652 2.35216C16.1116 2.82096 16.1116 3.57855 15.6652 4.04735L6.52179 13.6484C6.07534 14.1172 5.35387 14.1172 4.90742 13.6484L0.334733 8.84787C-0.111578 8.37907 -0.111578 7.62149 0.334733 7.15269C0.781115 6.68389 1.50473 6.68389 1.95118 7.15269L5.68246 11.1019L14.0508 2.35216C14.4972 1.88261 15.2187 1.88261 15.6652 2.35216Z" fill="#605F56"/>
                    </svg>
                    Applied
                  </Button>
                ) : (
                  <Button
                    onClick={scrollToApplication}
                    className="w-full bg-primary hover:bg-primary/90 rounded-lg"
                    style={{
                      color: '#FFF',
                      textAlign: 'center',
                      fontFamily: '"Plus Jakarta Sans"',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '24px',
                      padding: '12px 24px',
                    }}
                  >
                    Apply
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Job Summary Card */}
          <div className="hidden lg:block bg-card rounded-lg border border-border p-6 mb-4 md:mb-5">
            <div className="space-y-5">
              {/* New Badge */}
              {isNew && (
                <div>
                  <svg width="51" height="26" viewBox="0 0 51 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="51" height="26" rx="13" fill="#F1ECFF"/>
                    <path d="M12.864 18V9.06H14.136L19.056 15.684L18.396 15.816V9.06H20.028V18H18.744L13.896 11.328L14.496 11.196V18H12.864ZM24.7225 18.144C24.0505 18.144 23.4625 17.992 22.9585 17.688C22.4545 17.384 22.0625 16.972 21.7825 16.452C21.5025 15.932 21.3625 15.356 21.3625 14.724C21.3625 14.068 21.5025 13.488 21.7825 12.984C22.0705 12.472 22.4585 12.068 22.9465 11.772C23.4425 11.476 23.9945 11.328 24.6025 11.328C25.1145 11.328 25.5625 11.412 25.9465 11.58C26.3385 11.748 26.6705 11.98 26.9425 12.276C27.2145 12.572 27.4225 12.912 27.5665 13.296C27.7105 13.672 27.7825 14.08 27.7825 14.52C27.7825 14.632 27.7745 14.748 27.7585 14.868C27.7505 14.988 27.7305 15.092 27.6985 15.18H22.6585V13.98H26.8105L26.0665 14.544C26.1385 14.176 26.1185 13.848 26.0065 13.56C25.9025 13.272 25.7265 13.044 25.4785 12.876C25.2385 12.708 24.9465 12.624 24.6025 12.624C24.2745 12.624 23.9825 12.708 23.7265 12.876C23.4705 13.036 23.2745 13.276 23.1385 13.596C23.0105 13.908 22.9625 14.288 22.9945 14.736C22.9625 15.136 23.0145 15.492 23.1505 15.804C23.2945 16.108 23.5025 16.344 23.7745 16.512C24.0545 16.68 24.3745 16.764 24.7345 16.764C25.0945 16.764 25.3985 16.688 25.6465 16.536C25.9025 16.384 26.1025 16.18 26.2465 15.924L27.5185 16.548C27.3905 16.86 27.1905 17.136 26.9185 17.376C26.6465 17.616 26.3225 17.804 25.9465 17.94C25.5785 18.076 25.1705 18.144 24.7225 18.144ZM30.6182 18L28.3742 11.472H30.0302L31.6742 16.428L31.0982 16.416L32.8502 11.472H34.2422L35.9822 16.416L35.4062 16.428L37.0502 11.472H38.7062L36.4622 18H35.0582L33.2822 12.828H33.8102L32.0102 18H30.6182Z" fill="#7E3DD4"/>
                  </svg>
                </div>
              )}

              {/* Title, Company, Posted Date with Apply Button */}
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <h1 className="text-foreground font-bold leading-tight" style={{ fontSize: '22px' }}>
                    {job.title}
                  </h1>
                  <a
                    href={job.company_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary text-base font-bold underline hover:opacity-80 transition-opacity"
                  >
                    {job.company}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  {postedDate && (
                    <p className="text-sm" style={{ color: '#605F56' }}>
                      Posted {postedDate}
                    </p>
                  )}
                </div>

                {/* Desktop Apply Button */}
                <div>
                  {hasApplied ? (
                    <Button
                      disabled
                      className="cursor-not-allowed h-10 px-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: '#F2F2EC',
                        color: '#605F56',
                        textAlign: 'center',
                        fontFamily: '"Plus Jakarta Sans"',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: '24px',
                        gap: '8px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.6652 2.35216C16.1116 2.82096 16.1116 3.57855 15.6652 4.04735L6.52179 13.6484C6.07534 14.1172 5.35387 14.1172 4.90742 13.6484L0.334733 8.84787C-0.111578 8.37907 -0.111578 7.62149 0.334733 7.15269C0.781115 6.68389 1.50473 6.68389 1.95118 7.15269L5.68246 11.1019L14.0508 2.35216C14.4972 1.88261 15.2187 1.88261 15.6652 2.35216Z" fill="#605F56"/>
                      </svg>
                      Applied
                    </Button>
                  ) : (
                    <Button
                      onClick={scrollToApplication}
                      className="bg-primary hover:bg-primary/90 h-10 px-6 rounded-lg flex-shrink-0"
                      style={{
                        color: '#FFF',
                        textAlign: 'center',
                        fontFamily: '"Plus Jakarta Sans"',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: '24px',
                      }}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border"></div>

              {/* Details Section */}
              <div className="space-y-5">
                {/* Wage */}
                <div className="flex items-center gap-4">
                  <Banknote className="h-6 w-6 text-foreground flex-shrink-0" />
                  <p className="text-foreground text-base font-medium">
                    {wageRange}
                  </p>
                </div>

                {/* Shift Time */}
                <div className="flex items-center gap-4">
                  <CalendarClock className="h-6 w-6 text-foreground flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-foreground text-base font-medium">
                      {job.employment_type || 'Full-time'}{job.schedule_days && ` • ${job.schedule_days}`}
                    </p>
                    {job.schedule_times && (
                      <p className="text-base font-medium" style={{ color: '#605F56' }}>
                        {job.schedule_times}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-foreground flex-shrink-0" />
                  <div className="text-foreground text-base font-medium">
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80 transition-opacity"
                      >
                        {addressLines.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </a>
                    ) : (
                      <>
                        {addressLines.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Section */}
          {sanitizedDescription && (
          <div className="bg-card rounded-lg border border-border p-5 md:p-6 mb-4 md:mb-5 space-y-4">
            <h2
              style={{
                color: '#000',
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: '18px',
                fontWeight: 700,
                lineHeight: '28px',
                letterSpacing: '0.18px'
              }}
            >
              Job Description
            </h2>
            <div
              className="prose-custom text-foreground"
              style={{
                fontSize: '16px',
                lineHeight: '1.5',
                fontWeight: 500
              }}
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
          )}

          {/* Extra Fields Sections */}
          {job.extra && typeof job.extra === 'object' && (
          <div className="space-y-4 md:space-y-5">
            {Object.entries(job.extra).map(([key, value]) => {
              if (!value || key === 'address') return null;

              // Format section header
              const sectionTitle = key
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={key} className="bg-card rounded-lg border border-border p-5 md:p-6 space-y-4">
                  <h2 className="text-foreground text-lg md:text-xl font-bold">{sectionTitle}</h2>
                  {Array.isArray(value) ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {value.map((item, idx) => (
                        <li key={idx} className="text-foreground text-base leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-foreground text-base leading-relaxed">{String(value)}</p>
                  )}
                </div>
              );
            })}
          </div>
          )}

          {/* Application Form */}
          <div id="application-form">
          <ApplicationForm
            jobReferenceNumber={job.referencenumber}
            onSubmit={handleApplicationSubmit}
            hasAlreadyApplied={hasApplied}
            profileUrl={job.profile_url || ''}
            jobRequestUrl={job.job_request_url || ''}
          />
          </div>

          {/* Powered by Homebase */}
          <div className="text-center mt-6">
          <p className="text-base font-normal">
            <span className="text-muted-foreground">Powered by </span>
            <span className="text-primary font-medium">homebase</span>
          </p>
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 pt-6 border-t border-border space-y-1 text-xs text-muted-foreground">
          {job.referencenumber && (
            <p>
              Reference:{' '}
              {job.job_url ? (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80 transition-opacity"
                >
                  {job.referencenumber}
                </a>
              ) : (
                job.referencenumber
              )}
            </p>
          )}
          {job.is_active === false && (
            <p className="text-destructive">This job may no longer be active</p>
          )}
          </div>
        </div>
      </div>

      {/* Payload Modal */}
      <PayloadModal
        isOpen={isModalOpen}
        onClose={handlePayloadClose}
        payload={payload}
      />

      {/* Success Modal (Desktop) */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        applicantName={payload?.hiring_applicant?.first_name || 'Applicant'}
        jobTitle={job?.title || ''}
        companyName={job?.company || ''}
        jobUrl={job?.job_url || undefined}
        companyUrl={job?.company_url || undefined}
      />
    </>
  );
}
