declare module 'sonner@2.0.3';
declare module 'sonner';
declare module 'react/jsx-runtime';
declare module 'react-router';

// Fallbacks for any version-suffixed packages used in imports
declare module '*@*' {
  const v: any;
  export default v;
}
