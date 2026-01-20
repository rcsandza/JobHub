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
import { Banknote, MapPin, Building2 } from 'lucide-react';

interface Job {
  id: string;
  referencenumber: string | null;
  title: string;
  company: string;
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
  target_wage_rate: number | null;
  target_wage_rate_max: number | null;
  publisher: string | null;
  publisher_url: string | null;
  last_build_date: string | null;
  job_count: number | null;
  notes: string | null;
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
    if (job.target_wage_rate && job.target_wage_rate_max) {
      return `$${job.target_wage_rate}–$${job.target_wage_rate_max}/hr`;
    } else if (job.target_wage_rate) {
      return `$${job.target_wage_rate}+/hr`;
    }
    return 'Competitive salary'; // Fallback
  };

  const wageRange = formatWage();

  // Format wage with employment type
  const wageWithType = `${wageRange} • ${job.employment_type || 'Full-time'}`;

  // Get shift preference from extra data or use fallback
  const shiftPreference = job.extra?.shift_preference || 'Flexible schedule';

  // Format full address
  const formatAddress = () => {
    // Try to build address from extra field
    if (job.extra?.address) {
      return job.extra.address;
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
        {/* Main Content */}
        <div className="container mx-auto w-full max-w-[800px] px-4 md:px-6 py-4 md:py-5">
        {/* Top Section Card */}
        <div className="bg-card rounded-lg p-6 md:p-6 mb-4 md:mb-5">
          {/* Top Section: Badge, Title, Posted Date, Apply Button */}
          <div className="space-y-5">
            {/* New Badge */}
            {isNew && (
              <Badge className="bg-purple-100 text-primary hover:bg-purple-100 border-0 text-xs font-bold px-3 py-1">
                New
              </Badge>
            )}

            {/* Job Title and Posted Date with Apply Button */}
            <div className="flex items-center justify-between gap-6">
              {/* Left: Title and Posted Date */}
              <div className="space-y-0.5 flex-1">
                <h1 className="text-foreground font-bold leading-tight" style={{ fontSize: '22px' }}>
                  {job.title}
                </h1>
                {postedDate && (
                  <p className="text-foreground text-sm">
                    Posted {postedDate}
                  </p>
                )}
              </div>

              {/* Right: Desktop Apply Button */}
              <Button
                onClick={scrollToApplication}
                className="hidden lg:block bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 text-base font-semibold rounded-lg flex-shrink-0"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-5"></div>

          {/* Details Section */}
          <div className="space-y-5 mb-5">
            {/* Wage, Employment Type, and Shift Preference */}
            <div className="flex items-start gap-3.5">
              <Banknote className="h-6 w-6 text-foreground flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-foreground text-base font-medium">
                  {wageWithType}
                </p>
                <p className="text-muted-foreground text-base font-medium">
                  {shiftPreference}
                </p>
              </div>
            </div>

            {/* Company Name */}
            <div className="flex items-start gap-3.5">
              <Building2 className="h-6 w-6 text-foreground flex-shrink-0" />
              <p className="text-foreground text-base font-medium">
                {job.company}
              </p>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3.5">
              <MapPin className="h-6 w-6 text-foreground flex-shrink-0" />
              <div className="text-foreground text-base font-medium">
                {addressLines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
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
          <div className="bg-card rounded-lg p-5 md:p-6 mb-4 md:mb-5 space-y-4">
            <h2 className="text-foreground text-lg md:text-xl font-bold">Job Description</h2>
            <div
              className="prose-custom text-foreground"
              style={{
                fontSize: '18px',
                lineHeight: '1.5'
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
        <div id="application-form">
          <ApplicationForm
            jobReferenceNumber={job.referencenumber}
            onSubmit={handleApplicationSubmit}
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
            <p>Reference: {job.referencenumber}</p>
          )}
          {job.is_active === false && (
            <p className="text-destructive">This job may no longer be active</p>
          )}
        </div>
      </div>

      {/* Payload Modal */}
      <PayloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payload={payload}
      />
      </div>
    </>
  );
}
