import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      {/* Redirect /toolkits/* to client-side fallback page */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var path = window.location.pathname;
              var match = path.match(/^\/toolkits\/(.+)/);
              if (match && match[1] !== 'fallback') {
                window.location.replace('/toolkits/fallback?slug=' + encodeURIComponent(match[1]));
              }
            })();
          `,
        }}
      />
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          padding: '2rem 1rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          404
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '1.5rem',
          }}
        >
          页面未找到
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.6rem 1.4rem',
            background: 'var(--color-accent)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
          }}
        >
          返回首页
        </Link>
      </main>
    </>
  );
}
