import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationForm } from '@/app/components/ApplicationForm';

describe('ApplicationForm', () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    jobReferenceNumber: 'REF-123',
    onSubmit: mockOnSubmit,
    hasAlreadyApplied: false,
    profileUrl: 'https://example.com/profile',
    jobRequestUrl: 'https://example.com/job',
    isSubmitting: false,
    submitError: null,
    jobTitle: 'Software Engineer',
    city: 'New York',
    company: 'Tech Corp',
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render form fields', () => {
    render(<ApplicationForm {...defaultProps} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
  });

  it('should format phone number input', async () => {
    const user = userEvent.setup();
    render(<ApplicationForm {...defaultProps} />);

    const phoneInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;

    await user.type(phoneInput, '1234567890');
    expect(phoneInput.value).toBe('123-456-7890');
  });

  it('should format zipcode input', async () => {
    const user = userEvent.setup();
    render(<ApplicationForm {...defaultProps} />);

    const zipcodeInput = screen.getByLabelText(/zip code/i) as HTMLInputElement;

    await user.type(zipcodeInput, '12345');
    expect(zipcodeInput.value).toBe('12345');

    // Should limit to 5 digits
    await user.type(zipcodeInput, '67890');
    expect(zipcodeInput.value).toBe('12345');
  });

  it('should show dynamic job alert checkbox label', () => {
    render(<ApplicationForm {...defaultProps} />);

    expect(
      screen.getByText(/Receive alerts for more Software Engineer jobs in New York/i)
    ).toBeInTheDocument();
  });

  it('should show dynamic company alert checkbox label', () => {
    render(<ApplicationForm {...defaultProps} />);

    expect(
      screen.getByText(/Receive alerts for more jobs from Tech Corp/i)
    ).toBeInTheDocument();
  });

  it('should show Applied button when hasAlreadyApplied is true', () => {
    render(<ApplicationForm {...defaultProps} hasAlreadyApplied={true} />);

    const button = screen.getByRole('button', { name: /applied/i });
    expect(button).toBeDisabled();
  });

  it('should show submit error when provided', () => {
    render(<ApplicationForm {...defaultProps} submitError="Error submitting application" />);

    expect(screen.getByText(/Error submitting application/i)).toBeInTheDocument();
  });

  it('should disable submit button when isSubmitting is true', () => {
    render(<ApplicationForm {...defaultProps} isSubmitting={true} />);

    const button = screen.getByRole('button', { name: /processing/i });
    expect(button).toBeDisabled();
  });

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup();
    render(<ApplicationForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/zip code/i), '12345');

    const submitButton = screen.getByRole('button', { name: /submit application/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          hiring_applicant: expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            zip: '12345',
            job_alerts_role: true,
            job_alerts_location: true,
          }),
          profile_url: 'https://example.com/profile',
          job_request_url: 'https://example.com/job',
        })
      );
    });
  });

  it('should handle checkbox state', async () => {
    const user = userEvent.setup();
    render(<ApplicationForm {...defaultProps} />);

    const jobAlertsCheckbox = screen.getByLabelText(/Receive alerts for more.*jobs in/i);
    const companyAlertsCheckbox = screen.getByLabelText(/Receive alerts for more jobs from/i);

    // Both should be checked by default
    expect(jobAlertsCheckbox).toBeChecked();
    expect(companyAlertsCheckbox).toBeChecked();

    // Uncheck
    await user.click(jobAlertsCheckbox);
    await user.click(companyAlertsCheckbox);

    expect(jobAlertsCheckbox).not.toBeChecked();
    expect(companyAlertsCheckbox).not.toBeChecked();
  });
});
