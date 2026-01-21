import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { formatDistance } from 'date-fns';
import { supabase } from '../lib/supabase';
import { JobDetailSkeleton } from './JobDetailSkeleton';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ApplicationForm } from './ApplicationForm';
import { PayloadModal } from './PayloadModal';
import { MobileJobHeader } from './MobileJobHeader';
import { Banknote, MapPin, ChevronRight, Calendar } from 'lucide-react';

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
      return `$${minWage} - $${maxWage} per hour`;
    } else if (minWage) {
      return `$${minWage}+ per hour`;
    }
    return null;
  };

  const wageRange = formatWage();

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

    return 'Location not specified';
  };

  const address = formatAddress();
  const addressLines = address.split('\n');

  // Sanitize HTML description
  const sanitizedDescription = job.description_html
    ? DOMPurify.sanitize(job.description_html)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Job Header */}
      <MobileJobHeader title={job.title} />

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl px-4 py-6">
        {/* Top Section Card */}
        <div className="bg-card rounded-lg p-6 mb-6 space-y-4">
          {/* New Badge */}
          {isNew && (
            <Badge className="bg-purple-100 text-primary hover:bg-purple-100 border-0">
              New
            </Badge>
          )}

          {/* Job Title */}
          <h1 className="text-foreground text-2xl md:text-3xl font-bold leading-tight">
            {job.title}
          </h1>

          {/* Company Name with Link */}
          <a
            href={job.company_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary font-medium text-base hover:underline"
          >
            {job.company}
            <ChevronRight className="h-4 w-4" />
          </a>

          {/* Posted Date */}
          {postedDate && (
            <p className="text-foreground text-sm">
              Posted {postedDate}
            </p>
          )}

          {/* Wage Range */}
          {wageRange && (
            <div className="flex items-start gap-3">
              <Banknote className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
              <p className="text-foreground text-base">
                {wageRange}
              </p>
            </div>
          )}

          {/* Employment Type and Schedule */}
          {(job.employment_type || job.schedule_days || job.schedule_times) && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
              <div className="text-base">
                <div className="text-foreground">
                  {job.employment_type && <span>{job.employment_type}</span>}
                  {job.employment_type && job.schedule_days && <span> • </span>}
                  {job.schedule_days && <span>{job.schedule_days}</span>}
                </div>
                {job.schedule_times && (
                  <div className="text-muted-foreground">
                    {job.schedule_times}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Address with Google Maps Link */}
          {job.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
              <div className="text-base">
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline"
                  >
                    {addressLines.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </a>
                ) : (
                  <div className="text-foreground">
                    {addressLines.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Job Description Section */}
        {sanitizedDescription && (
          <div className="bg-card rounded-lg p-6 mb-6 space-y-4">
            <h2 className="text-foreground text-xl font-bold">Job Description</h2>
            <div
              className="prose-custom text-foreground"
              style={{
                fontSize: 'var(--text-base)',
                lineHeight: '1.75'
              }}
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>
        )}

        {/* Extra Fields Sections */}
        {job.extra && typeof job.extra === 'object' && (
          <div className="space-y-6">
            {Object.entries(job.extra).map(([key, value]) => {
              if (!value || key === 'address') return null;

              // Format section header
              const sectionTitle = key
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={key} className="bg-card rounded-lg p-6 space-y-4">
                  <h2 className="text-foreground text-xl font-bold">{sectionTitle}</h2>
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
        <ApplicationForm
          jobReferenceNumber={job.referencenumber}
          onSubmit={handleApplicationSubmit}
        />

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
  );
}
