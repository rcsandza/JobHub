import { useState, FormEvent, ChangeEvent } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X } from 'lucide-react';

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
  const [receiveJobAlerts, setReceiveJobAlerts] = useState(true);
  const [receiveCompanyAlerts, setReceiveCompanyAlerts] = useState(true);

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

  const handleRemoveFile = () => {
    setResumeFile(null);
    // Reset the file input
    const fileInput = document.getElementById('resume') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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

  return (
    <div className="bg-card rounded-lg p-6 md:p-6 mb-4 md:mb-5 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-foreground font-bold" style={{ fontSize: '22px' }}>
          Apply to this job
        </h1>
        <p className="text-muted-foreground text-base font-medium">
          Fill out the fields below to apply
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Fields Container */}
        <div className="space-y-5">
          {/* First and Last Name - Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-bold block" style={{ color: 'var(--text-secondary, #605F56)', lineHeight: '21px' }}>
                First name <span className="text-destructive">*</span>
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-bold block" style={{ color: 'var(--text-secondary, #605F56)', lineHeight: '21px' }}>
                Last name <span className="text-destructive">*</span>
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="emailAddress" className="text-sm font-bold block" style={{ color: 'var(--text-secondary, #605F56)', lineHeight: '21px' }}>
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="emailAddress"
              name="emailAddress"
              type="email"
              required
              value={formData.emailAddress}
              onChange={handleInputChange}
            />
          </div>

          {/* Phone and Zip Code - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-bold block" style={{ color: 'var(--text-secondary, #605F56)', lineHeight: '21px' }}>
                Phone number <span className="text-destructive">*</span>
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(---) --- ----"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="zipcode" className="text-sm font-bold block" style={{ color: 'var(--text-secondary, #605F56)', lineHeight: '21px' }}>
                Zip code <span className="text-destructive">*</span>
              </label>
              <Input
                id="zipcode"
                name="zipcode"
                type="text"
                required
                value={formData.zipcode}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="space-y-4">
          {/* Job Alerts Checkbox */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="jobAlerts"
              checked={receiveJobAlerts}
              onChange={(e) => setReceiveJobAlerts(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer flex-shrink-0"
              style={{
                accentColor: 'var(--primary)',
              }}
            />
            <label htmlFor="jobAlerts" className="text-foreground text-base font-medium cursor-pointer flex-1" style={{ lineHeight: '24px' }}>
              Receive alerts for more Assistant Kitchen Manager jobs in Los Angeles
            </label>
          </div>

          {/* Company Alerts Checkbox */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="companyAlerts"
              checked={receiveCompanyAlerts}
              onChange={(e) => setReceiveCompanyAlerts(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer flex-shrink-0"
              style={{
                accentColor: 'var(--primary)',
              }}
            />
            <label htmlFor="companyAlerts" className="text-foreground text-base font-medium cursor-pointer flex-1" style={{ lineHeight: '24px' }}>
              Receive alerts for more jobs from Limonata by Paninos
            </label>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="space-y-2">
          <Input
            id="resume"
            name="resume"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />

          {!resumeFile ? (
            <div className="space-y-1">
              <label htmlFor="resume" className="text-primary font-bold text-base cursor-pointer inline-block transition-colors">
                Upload resume (optional)
              </label>
              <p className="caption text-muted-foreground">
                We accept .doc, .docx, .pdf
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold block" style={{ color: 'var(--text-secondary, #605F56)', lineHeight: '21px' }}>
                Uploaded resume
              </label>
              <div className="flex items-center justify-between p-3 bg-muted rounded border border-border">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg className="h-5 w-5 text-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-foreground text-sm font-medium truncate">
                    {resumeFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-2 p-1 hover:bg-destructive/10 rounded-full transition-colors flex-shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5 text-destructive" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button - Right aligned on desktop */}
        <div className="lg:flex lg:justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-12 lg:h-10 lg:px-8 text-base font-bold rounded-lg"
          >
            {isSubmitting ? 'Processing...' : 'Submit application'}
          </Button>
        </div>
      </form>
    </div>
  );
}