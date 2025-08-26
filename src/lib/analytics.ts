import { event as pixelEvent } from '@/components/MetaPixel/MetaPixel';

export const trackRegistrationStart = () => {
  pixelEvent('StartRegistration');
};

export const trackRegistrationComplete = (value: number, currency: string) => {
  pixelEvent('Purchase', {
    currency,
    value,
  });
};

export const trackRegistrationView = () => {
  pixelEvent('ViewContent', {
    content_type: 'registration',
  });
};

export const trackCategoryView = (category: string) => {
  pixelEvent('ViewContent', {
    content_type: 'category',
    content_name: category,
  });
}; 