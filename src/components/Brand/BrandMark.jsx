export default function BrandMark({ className = 'w-10 h-10', title = 'Rumbo' }) {
  const iconUrl = `${import.meta.env.BASE_URL}rumbo-icon.png`;

  return (
    <img
      src={iconUrl}
      className={`${className} object-contain`}
      alt={title}
      draggable={false}
    />
  );
}
