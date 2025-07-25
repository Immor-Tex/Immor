import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
}

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  price,
  availability,
  brand = 'IMMORTEX',
  category
}: SEOProps) => {
  const siteTitle = 'IMMORTEX - Premium Streetwear';
  const fullTitle = `${title} | ${siteTitle}`;
  const defaultImage = 'https://images.pexels.com/photos/14146828/pexels-photo-14146828.jpeg';
  const defaultUrl = 'https://immortex.com';
  const currentUrl = url || defaultUrl;

  // Structured data for products
  const productStructuredData = type === 'product' ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: image || defaultImage,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    category: category,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'USD',
      availability: availability ? `https://schema.org/${availability}` : undefined,
      url: currentUrl
    }
  } : null;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteTitle} />
      {type === 'product' && (
        <>
          <meta property="product:price:amount" content={price?.toString()} />
          <meta property="product:price:currency" content="USD" />
          <meta property="product:availability" content={availability?.toLowerCase()} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Additional */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="IMMORTEX" />

      {/* Structured Data */}
      {productStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(productStructuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 