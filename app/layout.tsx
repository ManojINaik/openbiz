import React from 'react';

export const metadata = {
  title: 'Udyam Registration',
  description: 'Udyam Registration Form - Steps 1 & 2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap 4 and AdminLTE for look-and-feel parity */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.2/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/admin-lte/3.2.0/css/adminlte.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}


