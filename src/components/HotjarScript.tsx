'use client';

import Script from 'next/script';

export function HotjarScript() {
  // More: https://gfw.atlassian.net/browse/RD-75
  // Production: 6664922, QA: 6664921
  const environment =
    process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'production';
  const hjid =
    process.env.NEXT_PUBLIC_HOTJAR_SITE_ID ||
    (environment === 'production' ? '6664922' : '6664921');

  return (
    <Script
      id="hotjar-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${hjid},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}} />
  );
}
