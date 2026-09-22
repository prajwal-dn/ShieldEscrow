function Loader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>

      <p className="mt-4 text-gray-600 font-medium">
        {message}
      </p>
    </div>
  );
}

export default Loader;