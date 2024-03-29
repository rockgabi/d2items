import '../styles/custom-theme.scss';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/styles.scss';
import { useEffect } from 'react';
import { ToastContainer } from "react-toastify";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // We need this because not all code execute in the browser
    /* typeof document !== undefined ? require('bootstrap/dist/js/bootstrap') : null; */
    
  }, []);

  return <>
    <Component {...pageProps} />
    <ToastContainer
      position="top-right"
      autoClose={8000}
      hideProgressBar={false}
      newestOnTop={false}
      draggable={false}
      pauseOnVisibilityChange
      closeOnClick
      pauseOnHover
    />
  </>
}