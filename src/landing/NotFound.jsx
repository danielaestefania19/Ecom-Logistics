/**
 * NotFound component that displays a 404 error message when a page is not found.
 * Provides a user-friendly message indicating that the page could not be found.
 *
 * @component
 * @returns {JSX.Element} A styled 404 error page with a message.
 */
function NotFound() {
    return (
      <div className="flex items-center justify-center h-screen bg-primary text-white font-bold">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-lg font-medium">Sorry, we couldn't find that page.</p>
        </div>
      </div>
    );
  }
  
  export default NotFound;
  