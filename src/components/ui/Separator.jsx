const Separator = ({ orientation = "horizontal", className = "" }) => (
  <div
    className={`bg-gray-200 ${
      orientation === "vertical" ? "w-px" : "h-px w-full"
    } ${className}`}
  />
);

export default Separator;
