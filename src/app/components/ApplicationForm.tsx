import { useState, FormEvent, ChangeEvent } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

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

  return (
    <div className="bg-card rounded-lg p-6 mb-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-foreground text-2xl md:text-3xl font-bold">
          Apply to this job
        </h1>
        <p className="text-muted-foreground text-base">
          Fill out the fields below to apply
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-foreground text-base">
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

        {/* Last Name */}
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-foreground text-base">
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

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="emailAddress" className="text-foreground text-base">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-foreground text-base">
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
            <label htmlFor="zipcode" className="text-foreground text-base">
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

        {/* Resume Upload */}
        <div className="space-y-2">
          <label htmlFor="resume" className="text-primary font-medium text-base">
            Upload resume
          </label>
          <Input
            id="resume"
            name="resume"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />
          <p className="text-muted-foreground text-sm">
            Optional (.doc, .docx, .pdf)
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-lg"
        >
          {isSubmitting ? 'Processing...' : 'Submit application'}
        </Button>
      </form>
    </div>
  );
}