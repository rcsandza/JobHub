import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicantName, jobTitle, companyName, jobUrl, companyUrl, jobSlug } = location.state || {};

  // Redirect to home if no data
  useEffect(() => {
    if (!applicantName || !jobTitle) {
      navigate('/');
    }
  }, [applicantName, jobTitle, navigate]);

  const handleClose = () => {
    if (jobSlug) {
      navigate(`/job/${jobSlug}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  if (!applicantName || !jobTitle) {
    return null;
  }

  return (
    <>
      <style>{`
        body, html {
          background-color: #FFFFFF !important;
          overflow: hidden !important;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        #root {
          background-color: #FFFFFF !important;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-item-1 {
          animation: fadeSlideUp 0.6s ease-out 0s both;
        }

        .animate-item-2 {
          animation: fadeSlideUp 0.6s ease-out 0.15s both;
        }

        .animate-item-3 {
          animation: fadeSlideUp 0.6s ease-out 0.3s both;
        }

        .animate-item-4 {
          animation: fadeSlideUp 0.6s ease-out 0.45s both;
        }

        .animate-item-5 {
          animation: fadeSlideUp 0.6s ease-out 0.6s both;
        }

        .animate-item-6 {
          animation: fadeSlideUp 0.6s ease-out 0.75s both;
        }

        .animate-item-7 {
          animation: fadeSlideUp 0.6s ease-out 0.9s both;
        }

        .success-page-container {
          min-height: 100vh;
          min-height: -webkit-fill-available;
          background-color: #FFFFFF;
        }
      `}</style>

      <div className="success-page-container w-screen bg-white flex items-center justify-center fixed inset-0 overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="w-full space-y-4" style={{ padding: '0 24px' }}>
          {/* Main success card */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            {/* Celebration illustration */}
            <div className="flex justify-center animate-item-1">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_123_1361)">
                  <mask id="mask0_123_1361" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="6" y="0" width="88" height="100">
                    <path d="M93.5102 0H6.375V99.823H93.5102V0Z" fill="white"/>
                  </mask>
                  <g mask="url(#mask0_123_1361)">
                    <path d="M49.9418 5.08057L54.5684 10.2898L61.5208 10.6622L60.3361 17.5311L64.3794 23.207L58.2788 26.5633L56.3662 33.2668L49.9418 30.584L43.5152 33.2668L41.6049 26.5633L35.502 23.207L39.5453 17.5311L38.3628 10.6622L45.3153 10.2898L49.9418 5.08057Z" fill="#F2F2EC"/>
                    <path d="M79.0704 0L83.6969 5.2092L90.6494 5.58391L89.4669 12.4529L93.5103 18.1264L87.4074 21.4851L85.497 28.1862L79.0704 25.5034L72.646 28.1862L70.7334 21.4851L64.6328 18.1264L68.6762 12.4529L67.4914 5.58391L74.4438 5.2092L79.0704 0Z" fill="#52258F"/>
                    <path d="M20.8126 40.8965L25.4391 46.1057L32.3916 46.4804L31.2091 53.3494L35.2525 59.0252L29.1495 62.3815L27.2392 69.085L20.8126 66.3999L14.3882 69.085L12.4756 62.3815L6.375 59.0252L10.4183 53.3494L9.23359 46.4804L16.186 46.1057L20.8126 40.8965Z" fill="#7E3DD4"/>
                    <path d="M49.9418 35.8184L54.5684 41.0276L61.5208 41.4L60.3361 48.2689L64.3794 53.9448L58.2788 57.3011L56.3662 64.0046L49.9418 61.3218L43.5152 64.0046L41.6049 57.3011L35.502 53.9448L39.5453 48.2689L38.3628 41.4L45.3153 41.0276L49.9418 35.8184Z" fill="#F2F2EC"/>
                    <path d="M79.0704 30.7378L83.6969 35.947L90.6494 36.3217L89.4669 43.1907L93.5103 48.8642L87.4074 52.2228L85.497 58.9263L79.0704 56.2412L72.646 58.9263L70.7334 52.2228L64.6328 48.8642L68.6762 43.1907L67.4914 36.3217L74.4438 35.947L79.0704 30.7378Z" fill="#E0FF00"/>
                    <path d="M20.8126 71.6343L25.4391 76.8435L32.3916 77.2182L31.2091 84.0872L35.2525 89.763L29.1495 93.1193L27.2392 99.8228L20.8126 97.14L14.3882 99.8228L12.4756 93.1193L6.375 89.763L10.4183 84.0872L9.23359 77.2182L16.186 76.8435L20.8126 71.6343Z" fill="#F2F2EC"/>
                    <path d="M49.9418 66.5562L54.5684 71.7653L61.5208 72.1378L60.3361 79.009L64.3794 84.6826L58.2788 88.0389L56.3662 94.7424L49.9418 92.0596L43.5152 94.7424L41.6049 88.0389L35.502 84.6826L39.5453 79.009L38.3628 72.1378L45.3153 71.7653L49.9418 66.5562Z" fill="#7E3DD4"/>
                    <path d="M53.0185 51.101C52.6304 51.6435 52.2332 52.1999 51.8291 52.7631C51.627 53.0458 51.425 53.3286 51.2206 53.616C50.8441 54.1355 50.4652 54.6596 50.0864 55.1838L49.7833 55.6022L49.7075 55.7079L49.6685 55.7608C49.6616 55.7769 49.6547 55.7631 49.6501 55.7539L49.6295 55.7286L49.4734 55.5263C49.2621 55.255 49.0532 54.9838 48.8419 54.7125C48.5021 54.2757 48.1623 53.8367 47.8225 53.3976C47.3794 52.8252 46.9316 52.2481 46.4862 51.6711C46.0913 51.1585 45.802 50.5585 45.5058 49.9769C45.4461 49.8573 45.5333 49.5953 45.6389 49.4826C45.74 49.3769 46.0132 49.2872 46.1142 49.3493C46.6653 49.6987 47.2967 50.0068 47.6985 50.4964L49.5124 52.701L49.5927 52.77L49.6249 52.7953C49.6249 52.7953 49.6341 52.7953 49.6387 52.7838L49.6524 52.7585L49.6938 52.6688L49.7007 52.6504V52.6413L49.7489 52.5769L49.9624 52.2711C51.0967 50.6435 52.247 49.0229 53.4157 47.4206C54.0104 46.6045 54.9104 46.0045 55.7255 45.3907C55.939 45.2298 56.3661 45.37 56.6944 45.3723C56.66 45.724 56.7312 46.1378 56.5704 46.4114C56.1916 47.0596 55.7163 47.6504 55.2594 48.2481C54.5729 49.1447 53.868 50.0275 53.0208 51.1056L53.0185 51.101Z" fill="#1E0B3A"/>
                    <path d="M81.9084 45.4368C81.6421 46.0529 81.3482 46.6782 81.0359 47.3104C80.8752 47.6254 80.7122 47.9426 80.54 48.2575C80.3471 48.5909 80.2461 48.8093 79.858 49.3955L79.6147 49.7748C79.5297 49.9035 79.4585 50.0208 79.3575 50.1656C79.1669 50.4437 78.9764 50.7242 78.7858 51.0047L78.6411 51.2162L78.6044 51.269L78.586 51.2943C78.586 51.2943 78.5745 51.315 78.5677 51.2989L78.4896 51.2024L78.1773 50.8116C77.9684 50.5495 77.7572 50.2943 77.5459 50.0162C77.0109 49.3219 76.4714 48.6254 75.9318 47.9288C75.5415 47.4208 75.2567 46.83 74.9674 46.2552C74.91 46.1357 74.9973 45.8759 75.1029 45.7633C75.2039 45.6575 75.4772 45.5679 75.5759 45.6277C76.1224 45.9702 76.7469 46.2736 77.1441 46.7564L78.0763 47.8874L78.3059 48.1656L78.3564 48.2139L78.4437 48.2897L78.462 48.3035C78.462 48.3035 78.4735 48.315 78.4781 48.2989L78.5057 48.2368L78.5309 48.1817L78.586 48.0759L78.6365 47.9748L78.7812 47.7058C78.8914 47.4989 79.0085 47.2966 79.1141 47.0828C79.982 45.4047 80.6892 43.6185 81.4217 41.8162C81.7936 40.8989 82.5169 40.0897 83.1896 39.3127C83.3687 39.1081 83.821 39.1587 84.1402 39.1035C84.1769 39.446 84.333 39.8093 84.2435 40.1012C84.0254 40.784 83.7154 41.4575 83.4215 42.1426C82.9784 43.1679 82.5146 44.1978 81.9061 45.4391L81.9084 45.4368Z" fill="#1E0B3A"/>
                    <path d="M22.937 86.584C22.2689 87.5955 21.5709 88.6529 20.8568 89.7334C20.5147 90.2414 20.1726 90.7541 19.8282 91.2667L19.5687 91.6552L19.4379 91.8506L19.4057 91.8989L19.3896 91.9242C19.3896 91.9242 19.3782 91.9472 19.3736 91.9311L19.307 91.8368L18.772 91.0759C18.2416 90.3173 17.7066 89.5541 17.174 88.7932C16.8433 88.3196 16.6229 87.7656 16.3956 87.2276C16.3497 87.1173 16.4576 86.8713 16.5724 86.7679C16.6803 86.669 16.9512 86.584 17.0408 86.6414C17.5367 86.9633 18.113 87.2437 18.4529 87.6966L18.8524 88.2253L19.0521 88.4897C19.1118 88.5679 19.2083 88.6989 19.2037 88.6851C19.2703 88.7518 19.3231 88.8001 19.3644 88.8345C19.4057 88.7587 19.4356 88.6805 19.4539 88.6299L19.4585 88.6207V88.6162C19.4585 88.6162 19.4585 88.6161 19.47 88.5978L19.5596 88.4575L19.7386 88.1771L20.0968 87.6185C21.052 86.1288 22.0209 84.646 23.0128 83.1794C23.518 82.4345 24.3331 81.8943 25.0655 81.338C25.2584 81.1909 25.6808 81.3288 25.9954 81.338C25.9931 81.6621 26.0941 82.0483 25.9632 82.2989C25.6533 82.8943 25.2469 83.4322 24.8565 83.9794C24.2711 84.7978 23.6672 85.6047 22.9416 86.5909L22.937 86.584Z" fill="#1E0B3A"/>
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_123_1361">
                    <rect width="87" height="100" fill="white" transform="translate(6.5)"/>
                  </clipPath>
                </defs>
              </svg>
            </div>

          {/* Success message */}
          <div className="space-y-4">
            <h1
              className="text-center animate-item-2"
              style={{
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: '30px',
                letterSpacing: '0.2px',
                color: '#000',
              }}
            >
              {applicantName}, your application has been submitted!
            </h1>

            {/* Divider */}
            <div className="border-t animate-item-3" style={{ borderColor: '#F2F2EC', borderWidth: '1.5px' }}></div>

            {/* Job links */}
            <div className="flex justify-center items-center">
              <div className="flex flex-col justify-center items-center gap-1">
                {/* Job title */}
                <div className="animate-item-4 text-center">
                {jobUrl ? (
                  <a
                    href={jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity block"
                    style={{
                      fontFamily: '"Plus Jakarta Sans"',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '24px',
                      color: '#000',
                      textAlign: 'center',
                    }}
                  >
                    {jobTitle}
                  </a>
                ) : (
                  <span
                    className="block"
                    style={{
                      fontFamily: '"Plus Jakarta Sans"',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '24px',
                      color: '#000',
                      textAlign: 'center',
                    }}
                  >
                    {jobTitle}
                  </span>
                )}
                </div>

                {/* Company name with chevron */}
                <div className="animate-item-5">
                {companyUrl ? (
                  <a
                    href={companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                    style={{
                      fontFamily: '"Plus Jakarta Sans"',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '23px',
                      color: '#7E3DD4',
                    }}
                  >
                    {companyName}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 4L10 8L6 12" stroke="#7E3DD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center gap-1"
                    style={{
                      fontFamily: '"Plus Jakarta Sans"',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '23px',
                      color: '#7E3DD4',
                    }}
                  >
                    {companyName}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 4L10 8L6 12" stroke="#7E3DD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next step card */}
        <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 animate-item-6">
          {/* Lightbulb icon */}
          <div className="flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.76 3.28821C2.365 3.08821 1.885 3.25321 1.685 3.64821C1.485 4.04321 1.65 4.52321 2.045 4.72321L5.245 6.32321C5.64 6.52321 6.12 6.35821 6.32 5.96321C6.52 5.56821 6.355 5.08821 5.96 4.88821L2.76 3.28821ZM29.96 4.71821C30.355 4.51821 30.515 4.03821 30.32 3.64321C30.125 3.24821 29.64 3.08821 29.245 3.28321L26.045 4.88321C25.65 5.08321 25.49 5.56321 25.685 5.95821C25.88 6.35321 26.365 6.51321 26.76 6.31821L29.96 4.71821ZM0.8 11.2032C0.36 11.2032 0 11.5632 0 12.0032C0 12.4432 0.36 12.8032 0.8 12.8032H4C4.44 12.8032 4.8 12.4432 4.8 12.0032C4.8 11.5632 4.44 11.2032 4 11.2032H0.8ZM28 11.2032C27.56 11.2032 27.2 11.5632 27.2 12.0032C27.2 12.4432 27.56 12.8032 28 12.8032H31.2C31.64 12.8032 32 12.4432 32 12.0032C32 11.5632 31.64 11.2032 31.2 11.2032H28ZM5.96 19.1182C6.355 18.9182 6.515 18.4382 6.32 18.0432C6.125 17.6482 5.64 17.4882 5.245 17.6832L2.045 19.2832C1.65 19.4832 1.49 19.9632 1.685 20.3582C1.88 20.7532 2.365 20.9132 2.76 20.7182L5.96 19.1182ZM26.76 17.6882C26.365 17.4882 25.885 17.6532 25.685 18.0482C25.485 18.4432 25.65 18.9232 26.045 19.1232L29.245 20.7232C29.64 20.9232 30.12 20.7582 30.32 20.3632C30.52 19.9682 30.355 19.4882 29.96 19.2882L26.76 17.6882ZM23.2 12.0032C23.2 13.5332 22.725 14.9432 21.915 16.1082C21.71 16.4032 21.48 16.7232 21.235 17.0582C20.6 17.9332 19.88 18.9182 19.335 19.9132C18.89 20.7232 18.65 21.5782 18.525 22.4082H20.15C20.26 21.8082 20.445 21.2232 20.74 20.6832C21.235 19.7832 21.85 18.9382 22.465 18.0932C22.725 17.7382 22.985 17.3832 23.235 17.0232C24.225 15.5982 24.805 13.8732 24.805 12.0082C24.8 7.14321 20.86 3.20321 16 3.20321C11.14 3.20321 7.2 7.14321 7.2 12.0032C7.2 13.8682 7.78 15.5982 8.77 17.0182C9.02 17.3782 9.28 17.7332 9.54 18.0882C10.155 18.9282 10.77 19.7732 11.265 20.6782C11.56 21.2182 11.745 21.8032 11.855 22.4032H13.475C13.35 21.5732 13.11 20.7182 12.665 19.9082C12.12 18.9082 11.4 17.9232 10.765 17.0532C10.52 16.7182 10.29 16.4032 10.085 16.1032C9.275 14.9432 8.8 13.5332 8.8 12.0032C8.8 8.02821 12.025 4.80321 16 4.80321C19.975 4.80321 23.2 8.02821 23.2 12.0032ZM12 12.0032C12 9.79321 13.79 8.00321 16 8.00321C16.44 8.00321 16.8 7.64321 16.8 7.20321C16.8 6.76321 16.44 6.40321 16 6.40321C12.905 6.40321 10.4 8.90821 10.4 12.0032C10.4 12.4432 10.76 12.8032 11.2 12.8032C11.64 12.8032 12 12.4432 12 12.0032ZM16 27.2032C14.955 27.2032 14.065 26.5332 13.735 25.6032H18.26C17.93 26.5332 17.04 27.2032 15.995 27.2032H16ZM12 24.5382V24.8032C12 27.0132 13.79 28.8032 16 28.8032C18.21 28.8032 20 27.0132 20 24.8032V24.5382C20 24.2432 19.76 24.0032 19.465 24.0032H12.535C12.24 24.0032 12 24.2432 12 24.5382Z" fill="#1E0B3A"/>
              <path d="M2.76 3.08801C2.365 2.88801 1.885 3.05301 1.685 3.44801C1.485 3.84301 1.65 4.32301 2.045 4.52301L5.245 6.12301C5.64 6.32301 6.12 6.15801 6.32 5.76301C6.52 5.36801 6.355 4.88801 5.96 4.68801L2.76 3.08801ZM29.96 4.51801C30.355 4.31801 30.515 3.83801 30.32 3.44301C30.125 3.04801 29.64 2.88801 29.245 3.08301L26.045 4.68301C25.65 4.88301 25.49 5.36301 25.685 5.75801C25.88 6.15301 26.365 6.31301 26.76 6.11801L29.96 4.51801ZM0.8 11.003C0.36 11.003 0 11.363 0 11.803C0 12.243 0.36 12.603 0.8 12.603H4C4.44 12.603 4.8 12.243 4.8 11.803C4.8 11.363 4.44 11.003 4 11.003H0.8ZM28 11.003C27.56 11.003 27.2 11.363 27.2 11.803C27.2 12.243 27.56 12.603 28 12.603H31.2C31.64 12.603 32 12.243 32 11.803C32 11.363 31.64 11.003 31.2 11.003H28ZM5.96 18.918C6.355 18.718 6.515 18.238 6.32 17.843C6.125 17.448 5.64 17.288 5.245 17.483L2.045 19.083C1.65 19.283 1.49 19.763 1.685 20.158C1.88 20.553 2.365 20.713 2.76 20.518L5.96 18.918ZM26.76 17.488C26.365 17.288 25.885 17.453 25.685 17.848C25.485 18.243 25.65 18.723 26.045 18.923L29.245 20.523C29.64 20.723 30.12 20.558 30.32 20.163C30.52 19.768 30.355 19.288 29.96 19.088L26.76 17.488ZM12 11.803C12 9.59301 13.79 7.80301 16 7.80301C16.44 7.80301 16.8 7.44301 16.8 7.00301C16.8 6.56301 16.44 6.20301 16 6.20301C12.905 6.20301 10.4 8.70801 10.4 11.803C10.4 12.243 10.76 12.603 11.2 12.603C11.64 12.603 12 12.243 12 11.803Z" fill="#7E3DD4"/>
            </svg>
          </div>

          {/* Card text */}
          <div className="flex-1 space-y-1">
            <h2
              style={{
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '21px',
                color: '#1E0B3A',
              }}
            >
              Next steps: We'll text you a short AI-guided conversation
            </h2>
            <p
              style={{
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#605F56',
              }}
            >
              Most candidates who complete this are invited to an interview!
            </p>
          </div>
        </div>

        {/* Done button - full width at bottom */}
        <button
          onClick={handleClose}
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg animate-item-7"
          style={{
            padding: '12px 24px',
            fontFamily: '"Plus Jakarta Sans"',
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '24px',
          }}
        >
          Done
        </button>
      </div>
    </div>
    </>
  );
}
