import { useState, FormEvent, ChangeEvent } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { formatPhoneNumber, formatZipcode, fileToBase64, getDataUriScheme } from '@/utils';

interface ApplicationFormProps {
  jobReferenceNumber: string | null;
  onSubmit: (payload: any) => void;
  hasAlreadyApplied?: boolean;
  profileUrl?: string;
  jobRequestUrl?: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  jobTitle?: string;
  city?: string;
  company?: string;
}

export function ApplicationForm({ jobReferenceNumber, onSubmit, hasAlreadyApplied = false, profileUrl = '', jobRequestUrl = '', isSubmitting = false, submitError = null, jobTitle = '', city = '', company = '' }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phone: '',
    zipcode: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [receiveJobAlerts, setReceiveJobAlerts] = useState(true);
  const [receiveCompanyAlerts, setReceiveCompanyAlerts] = useState(true);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        phone: formatPhoneNumber(value),
      }));
    } else if (name === 'zipcode') {
      setFormData((prev) => ({
        ...prev,
        zipcode: formatZipcode(value),
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      let resumeData = null;
      if (resumeFile) {
        const base64Data = await fileToBase64(resumeFile);
        resumeData = {
          dataUriScheme: getDataUriScheme(resumeFile.name),
          file: base64Data,
        };
      }

      const payload = {
        hiring_applicant: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          zip: formData.zipcode,
          email: formData.emailAddress,
          original_source: 'homebase_vercel_apply',
          ...(resumeData && { resume: resumeData }),
          job_alerts_role: receiveJobAlerts,
          job_alerts_location: receiveCompanyAlerts,
        },
        profile_url: profileUrl,
        job_request_url: jobRequestUrl,
      };

      onSubmit(payload);
    } catch (error) {
      console.error('Error processing form:', error);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 md:p-6 mb-4 md:mb-5 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-foreground font-bold" style={{ fontSize: '22px' }}>
          Apply to this job
        </h1>
        <p className="text-base font-medium" style={{ color: '#605F56' }}>
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
              <label htmlFor="firstName" className="font-bold block" style={{ fontSize: '14px', color: '#000', lineHeight: '21px' }}>
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
              <label htmlFor="lastName" className="font-bold block" style={{ fontSize: '14px', color: '#000', lineHeight: '21px' }}>
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
            <label htmlFor="emailAddress" className="font-bold block" style={{ fontSize: '14px', color: '#000', lineHeight: '21px' }}>
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
              <label htmlFor="phone" className="font-bold block" style={{ fontSize: '14px', color: '#000', lineHeight: '21px' }}>
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
              <label htmlFor="zipcode" className="font-bold block" style={{ fontSize: '14px', color: '#000', lineHeight: '21px' }}>
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
              <label htmlFor="resume" className="text-primary font-bold cursor-pointer inline-block transition-colors" style={{ fontSize: '16px', lineHeight: '23px' }}>
                Upload resume (optional)
              </label>
              <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: '14px', fontWeight: 500, lineHeight: '24px', color: '#605F56' }}>
                We accept .doc, .docx, .pdf
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="font-bold block" style={{ fontSize: '14px', color: '#000', lineHeight: '21px' }}>
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
            <label htmlFor="jobAlerts" className="cursor-pointer flex-1" style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: '#1E0B3A' }}>
              Receive alerts for more {jobTitle || 'similar'} jobs{city ? ` in ${city}` : ''}
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
            <label htmlFor="companyAlerts" className="cursor-pointer flex-1" style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: '#1E0B3A' }}>
              Receive alerts for more jobs from {company || 'this company'}
            </label>
          </div>
        </div>

        {/* Submit Button - Right aligned on desktop */}
        <div className="space-y-3">
          {/* Button row - right aligned on desktop */}
          <div className="lg:flex lg:justify-end">
            {hasAlreadyApplied ? (
              <Button
                disabled
                className="w-full lg:w-auto cursor-not-allowed h-12 lg:h-10 px-6 lg:px-6 rounded-lg flex items-center justify-center"
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
                id="submit-application-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full lg:w-auto bg-primary hover:bg-primary/90 h-12 lg:h-10 lg:px-8 rounded-lg"
                style={{
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: '"Plus Jakarta Sans"',
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '24px'
                }}
              >
                {isSubmitting ? 'Processing...' : 'Submit application'}
              </Button>
            )}
          </div>

          {/* Error row - centered */}
          {submitError && (
            <p className="text-destructive text-sm text-center">{submitError}</p>
          )}
        </div>
      </form>
    </div>
  );
}