import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Upload, ChevronUp, ChevronDown } from 'lucide-react';

interface ApplicationFormProps {
  jobReferenceNumber: string | null;
  onSubmit: (payload: any) => void;
}

export function ApplicationForm({ jobReferenceNumber, onSubmit }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phone: '',
    zipcode: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFixed, setIsFixed] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // If the container's natural position would be visible in viewport, make it static
      // Otherwise keep it fixed at bottom
      if (rect.top <= viewportHeight - 80) {
        setIsFixed(false);
      } else {
        setIsFixed(true);
        // Collapse when fixed (floating over content)
        setIsExpanded(false);
      }
      
      // Auto-expand when scrolled to bottom
      const scrolledToBottom = 
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      
      if (scrolledToBottom) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedDigits = digits.slice(0, 10);
      
      // Format as xxx-xxx-xxxx
      let formattedPhone = limitedDigits;
      if (limitedDigits.length > 6) {
        formattedPhone = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
      } else if (limitedDigits.length > 3) {
        formattedPhone = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
      }
      
      setFormData((prev) => ({
        ...prev,
        phone: formattedPhone,
      }));
    } else if (name === 'zipcode') {
      // Remove all non-digit characters and limit to 5 digits
      const digits = value.replace(/\D/g, '').slice(0, 5);
      
      setFormData((prev) => ({
        ...prev,
        zipcode: digits,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let resumeData = null;
      if (resumeFile) {
        const base64Data = await fileToBase64(resumeFile);
        resumeData = {
          fileName: resumeFile.name,
          data: base64Data,
        };
      }

      const payload = {
        data: {
          applicant: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            emailAddress: formData.emailAddress,
            phone: formData.phone,
            zipcode: formData.zipcode,
            ...(resumeData && { resume: resumeData }),
          },
          job: {
            originalJobReference: jobReferenceNumber || '',
          },
          tlrSid: `job_chom_${Date.now()}`,
        },
      };

      onSubmit(payload);
    } catch (error) {
      console.error('Error processing form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div ref={containerRef} className="mt-8">
      <div
        ref={formRef}
        className={`transition-all duration-300 ${isFixed ? 'fixed bottom-0 left-0 right-0 z-40' : 'relative'}`}
        style={{
          transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 80px))',
        }}
      >
        <div className="container mx-auto max-w-4xl px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-t-[var(--radius-card)]"
            style={{ boxShadow: isFixed ? 'var(--elevation-lg)' : 'none' }}
          >
            {/* Header - Always Visible */}
            <div
              className="flex items-center justify-between p-6 cursor-pointer border-b border-border"
              onClick={toggleExpanded}
            >
              <div className="space-y-1">
                <h2 className="text-foreground">Apply for this Position</h2>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  {isExpanded ? 'Fill out the form below to submit your application' : 'Click to expand and apply'}
                </p>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isExpanded ? 'Collapse form' : 'Expand form'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-6 w-6" />
                ) : (
                  <ChevronUp className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Form Content - Collapsible */}
            <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="emailAddress" className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  required
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  placeholder="john.doe@gmail.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    Phone <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="555-555-5555"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="zipcode" className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    Zip Code <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="zipcode"
                    name="zipcode"
                    type="text"
                    required
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    placeholder="10110"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="resume" className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Resume
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="resume"
                    name="resume"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="flex-1"
                  />
                  {resumeFile && (
                    <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      <Upload className="h-4 w-4" />
                      <span className="truncate max-w-xs">{resumeFile.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Processing...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}