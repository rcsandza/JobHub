import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TopBar } from './TopBar';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  postal_code?: string;
  city?: string;
  state?: string;
  referencenumber?: string;
  employment_type?: string;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
  posted_at: string;
}

const ITEMS_PER_PAGE = 100;

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search filters
  const [companySearch, setCompanySearch] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [zipcodeSearch, setZipcodeSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [currentPage, companySearch, titleSearch, zipcodeSearch]);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('jobs')
        .select('id, slug, title, company, postal_code, city, state, referencenumber, employment_type, created_at, updated_at, is_active, posted_at', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      // Apply filters
      if (companySearch) {
        query = query.ilike('company', `%${companySearch}%`);
      }
      if (titleSearch) {
        query = query.ilike('title', `%${titleSearch}%`);
      }
      if (zipcodeSearch) {
        query = query.ilike('postal_code', `%${zipcodeSearch}%`);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setJobs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setCompanySearch('');
    setTitleSearch('');
    setZipcodeSearch('');
    setCurrentPage(1);
  };

  const isNew = (createdAt: string) => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreation <= 7;
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded-[var(--radius-card)]">
          <h2 className="text-destructive">Error Loading Jobs</h2>
          <p style={{ fontSize: 'var(--text-sm)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-foreground">Job Listings</h1>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Browse all available positions ({totalCount} total)
            </p>
          </div>

        {/* Search Filters */}
        <div className="bg-card p-6 rounded-[var(--radius-card)] border border-border space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-primary" />
            <h3 className="text-foreground">Search Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="company" className="text-foreground">
                Company
              </label>
              <Input
                id="company"
                placeholder="Search by company..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-foreground">
                Job Title
              </label>
              <Input
                id="title"
                placeholder="Search by title..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="zipcode" className="text-foreground">
                Zip Code
              </label>
              <Input
                id="zipcode"
                placeholder="Search by zip code..."
                value={zipcodeSearch}
                onChange={(e) => setZipcodeSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSearch} variant="default">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear All
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-card p-6 rounded-[var(--radius-card)] border border-border animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-card p-12 rounded-[var(--radius-card)] border border-border text-center">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-lg)' }}>
              No jobs found matching your search criteria
            </p>
          </div>
        ) : (
          <>
            {/* Jobs List */}
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/job/${job.slug}`}
                  className="block bg-card p-6 rounded-[var(--radius-card)] border border-border hover:border-primary transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                            {job.company}
                          </p>
                          {isNew(job.created_at) && (
                            <Badge variant="default" className="bg-primary">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-foreground hover:text-primary transition-colors">
                          {job.title}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {job.employment_type && (
                            <Badge variant="outline">{job.employment_type}</Badge>
                          )}
                          {(job.city || job.state) && (
                            <Badge variant="outline">
                              {[job.city, job.state].filter(Boolean).join(', ')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {job.posted_at && !isNaN(new Date(job.posted_at).getTime()) ? (
                          <p>
                            Posted{' '}
                            {formatDistance(new Date(job.posted_at), new Date(), {
                              addSuffix: true,
                            })}
                          </p>
                        ) : (
                          <p>Posted date not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-card p-4 rounded-[var(--radius-card)] border border-border">
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Page {currentPage} of {totalPages} ({totalCount} total jobs)
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
        </div>
      </div>
    </>
  );
}