const Toggle = ({ pressed, onPressedChange, children }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-8 px-3 ${
      pressed ? "bg-gray-200 text-gray-900" : "text-gray-700"
    }`}
    onClick={() => onPressedChange(!pressed)}
  >
    {children}
  </button>
);

export default Toggle;
