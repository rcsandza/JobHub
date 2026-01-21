import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { formatDistance } from 'date-fns';
import { supabase } from '../lib/supabase';
import { JobDetailSkeleton } from './JobDetailSkeleton';
import { TopBar } from './TopBar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ApplicationForm } from './ApplicationForm';
import { PayloadModal } from './PayloadModal';
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
}

export function JobDetail() {
  const params = useParams();
  const slug = params['*'] || '';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payload, setPayload] = useState<any>(null);

  const handleApplicationSubmit = (applicationPayload: any) => {
    setPayload(applicationPayload);
    setIsModalOpen(true);
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

    if (minWage && maxWage) {
      return `$${minWage}–$${maxWage}/hr`;
    } else if (minWage) {
      return `$${minWage}+/hr`;
    }
    return 'Competitive salary'; // Fallback
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
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <TopBar jobTitle={job?.title} />
      <div className="min-h-screen bg-background">
        {/* White background above card on mobile */}
        <div className="bg-card lg:bg-transparent h-9 lg:h-0"></div>

        {/* Main Content */}
        <div className="container mx-auto w-full max-w-[800px] pb-4 md:py-5">
          {/* Top Section Card - Edge to edge on mobile with white background above it */}
          <div className="bg-card lg:rounded-lg p-6 md:p-6 mb-4 md:mb-5 border-b lg:border border-border lg:mx-4 md:mx-6 -mt-4 md:-mt-5 lg:mt-0">
          {/* Top Section: Badge, Title, Company, Posted Date, Apply Button */}
          <div className="space-y-5">
            {/* New Badge */}
            {isNew && (
              <Badge className="bg-purple-100 text-primary hover:bg-purple-100 border-0 text-xs font-bold px-3 py-1">
                New
              </Badge>
            )}

            {/* Mobile: Title, Company, Posted Date */}
            <div className="space-y-2 lg:hidden">
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

            {/* Desktop: Title, Posted Date with Apply Button */}
            <div className="hidden lg:flex items-center justify-between gap-6">
              {/* Left: Title and Posted Date */}
              <div className="space-y-0.5 flex-1">
                <h1 className="text-foreground font-bold leading-tight" style={{ fontSize: '22px' }}>
                  {job.title}
                </h1>
                {postedDate && (
                  <p className="text-sm" style={{ color: '#605F56' }}>
                    Posted {postedDate}
                  </p>
                )}
              </div>

              {/* Right: Desktop Apply Button */}
              <Button
                onClick={scrollToApplication}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 text-base font-semibold rounded-lg flex-shrink-0"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-5"></div>

          {/* Details Section */}
          <div className="space-y-5 mb-5">
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
                    className="hover:underline"
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
          <Button
            onClick={scrollToApplication}
            className="w-full lg:hidden bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold rounded-lg"
          >
            Apply
          </Button>
        </div>

        {/* Job Description Section */}
        {sanitizedDescription && (
          <div className="bg-card rounded-lg p-5 md:p-6 mb-4 md:mb-5 space-y-4 mx-4 lg:mx-4 md:mx-6">
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
          <div className="space-y-4 md:space-y-5 mx-4 lg:mx-4 md:mx-6">
            {Object.entries(job.extra).map(([key, value]) => {
              if (!value || key === 'address') return null;

              // Format section header
              const sectionTitle = key
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={key} className="bg-card rounded-lg p-5 md:p-6 space-y-4">
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
        <div id="application-form" className="mx-4 lg:mx-4 md:mx-6">
          <ApplicationForm
            jobReferenceNumber={job.referencenumber}
            onSubmit={handleApplicationSubmit}
          />
        </div>

        {/* Powered by Homebase */}
        <div className="text-center mt-6 mx-4 lg:mx-4 md:mx-6">
          <p className="text-base font-normal">
            <span className="text-muted-foreground">Powered by </span>
            <span className="text-primary font-medium">homebase</span>
          </p>
        </div>

        {/* Footer Metadata */}
        <div className="mt-8 pt-6 border-t border-border space-y-1 text-xs text-muted-foreground mx-4 lg:mx-4 md:mx-6">
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
        onClose={() => setIsModalOpen(false)}
        payload={payload}
      />
    </>
  );
}
