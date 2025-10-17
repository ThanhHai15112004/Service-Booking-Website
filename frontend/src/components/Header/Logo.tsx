export default function Logo() {
  return (
    <a href="/" className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
        <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
      </div>
      <span className="text-sm font-semibold tracking-tight">BookStay</span>
    </a>
  );
}
