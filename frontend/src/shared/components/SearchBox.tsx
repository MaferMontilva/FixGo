import { Search } from "lucide-react";
import { FormEvent } from "react";

type SearchBoxProps = {
  describedBy?: string;
  error?: string;
  id?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder: string;
  buttonLabel?: string;
  value?: string;
};

export function SearchBox({
  describedBy,
  error,
  id,
  onChange,
  onSearch,
  placeholder,
  buttonLabel = "Buscar",
  value
}: SearchBoxProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(value ?? "");
  };

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <Search className="search-icon" size={26} />
      <input
        aria-describedby={[describedBy, error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error)}
        id={id}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      <button type="submit">{buttonLabel}</button>
    </form>
  );
}
