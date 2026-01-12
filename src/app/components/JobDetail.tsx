import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { formatDistance } from 'date-fns';
import { supabase } from '../lib/supabase';
import { JobDetailSkeleton } from './JobDetailSkeleton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ApplicationForm } from './ApplicationForm';
import { PayloadModal } from './PayloadModal';
import { ExternalLink } from 'lucide-react';

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
  // Capture the entire path after /job/ as the slug (may include slashes)
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

  // Check if recently updated
  const isRecentlyUpdated =
    job.updated_at &&
    job.posted_at &&
    new Date(job.updated_at) > new Date(job.posted_at);

  // Check if new (within last 7 days)
  const isNew =
    job.posted_at &&
    new Date().getTime() - new Date(job.posted_at).getTime() <
      7 * 24 * 60 * 60 * 1000;

  // Format wage range
  const formatWage = () => {
    if (job.target_wage_rate && job.target_wage_rate_max) {
      return `$${job.target_wage_rate} - $${job.target_wage_rate_max}/hr`;
    } else if (job.target_wage_rate) {
      return `$${job.target_wage_rate}+/hr`;
    }
    return null;
  };

  const wageRange = formatWage();

  // Sanitize HTML description
  const sanitizedDescription = job.description_html
    ? DOMPurify.sanitize(job.description_html)
    : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8 pb-6">
        {/* Header */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-muted-foreground uppercase tracking-wide" style={{ fontSize: 'var(--text-sm)' }}>
              {job.company}
            </p>
            <h1 className="text-foreground">{job.title}</h1>
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-2">
            {isNew && (
              <Badge variant="default" className="bg-primary">
                New
              </Badge>
            )}
            {isRecentlyUpdated && (
              <Badge variant="secondary">Recently Updated</Badge>
            )}
            {job.employment_type && (
              <Badge variant="outline">{job.employment_type}</Badge>
            )}
            {wageRange && <Badge variant="outline">{wageRange}</Badge>}
            {job.postal_code && (
              <Badge variant="outline">{job.postal_code}</Badge>
            )}
            {postedDate && (
              <Badge variant="outline">Posted {postedDate}</Badge>
            )}
            {job.is_active === false && (
              <Badge variant="destructive">May No Longer Be Active</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-6 bg-card p-6 rounded-[var(--radius-card)] border border-border">
          <h2>Job Description</h2>
          {sanitizedDescription ? (
            <div
              className="prose-custom text-foreground"
              style={{
                fontSize: 'var(--text-base)',
                lineHeight: '1.75'
              }}
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          ) : (
            <p className="text-muted-foreground">No description available</p>
          )}
        </div>

        {/* Additional info from extra field */}
        {job.extra && typeof job.extra === 'object' && (
          <div className="space-y-6">
            {Object.entries(job.extra).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="space-y-3 bg-card p-6 rounded-[var(--radius-card)] border border-border">
                  <h3 className="capitalize text-foreground">{key.replace(/_/g, ' ')}</h3>
                  {Array.isArray(value) ? (
                    <ul className="space-y-2 pl-1">
                      {value.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-primary mt-1 flex-shrink-0">✓</span>
                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-foreground">{String(value)}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Form - Sticky at bottom */}
      <ApplicationForm 
        jobReferenceNumber={job.referencenumber} 
        onSubmit={handleApplicationSubmit}
      />

      {/* Footer metadata */}
      <div className="border-t border-border pt-4 mt-8 space-y-1 text-muted-foreground">
        {job.referencenumber && (
          <p>Reference: {job.referencenumber}</p>
        )}
        {job.publisher && <p>Publisher: {job.publisher}</p>}
        {job.updated_at && (
          <p>
            Last updated:{' '}
            {formatDistance(new Date(job.updated_at), new Date(), {
              addSuffix: true,
            })}
          </p>
        )}
        {job.job_url && (
          <p>
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              View original posting
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        )}
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