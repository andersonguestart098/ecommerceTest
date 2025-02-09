import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { join } from 'path';

const generateSitemap = async () => {
  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/produtos', changefreq: 'weekly', priority: 0.8 },
    { url: '/contato', changefreq: 'monthly', priority: 0.5 },
    // Adicione mais URLs conforme necessário
  ];

  const sitemapStream = new SitemapStream({ hostname: 'https://natopisos.com.br' });

  const writeStream = createWriteStream(join(__dirname, 'public', 'sitemap.xml'));

  links.forEach(link => sitemapStream.write(link));
  sitemapStream.end();

  streamToPromise(sitemapStream).then(sm => {
    writeStream.write(sm.toString());
    console.log('✅ Sitemap gerado com sucesso!');
  });
};

generateSitemap();
