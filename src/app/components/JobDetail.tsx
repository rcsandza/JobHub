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
import { Banknote, MapPin } from 'lucide-react';

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
      return `$${job.target_wage_rate}–$${job.target_wage_rate_max} per hour`;
    } else if (job.target_wage_rate) {
      return `$${job.target_wage_rate}+ per hour`;
    }
    return null;
  };

  const wageRange = formatWage();

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
    if (job.extra?.city || job.postal_code) {
      const cityLine = [
        job.extra?.city,
        job.extra?.state,
        job.postal_code
      ].filter(Boolean).join(', ');
      if (cityLine) parts.push(cityLine);
    }
    if (parts.length === 0 && job.postal_code) {
      parts.push(job.postal_code);
    }
    parts.push('USA');

    return parts.filter(Boolean).join('\n') || 'Location not specified';
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

          {/* Posted Date */}
          {postedDate && (
            <p className="text-foreground text-sm">
              Posted {postedDate}
            </p>
          )}

          {/* Wage and Employment Type */}
          {(wageRange || job.employment_type) && (
            <div className="flex items-start gap-3">
              <Banknote className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
              <p className="text-foreground text-base">
                {wageRange}
                {wageRange && job.employment_type && ' • '}
                {job.employment_type}
              </p>
            </div>
          )}

          {/* Company Name */}
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5">
              <div className="w-5 h-5 bg-muted rounded" />
            </div>
            <p className="text-foreground text-base font-semibold">
              {job.company}
            </p>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
            <div className="text-foreground text-base">
              {addressLines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
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
