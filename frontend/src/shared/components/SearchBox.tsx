import { Search } from "lucide-react";

type SearchBoxProps = {
  placeholder: string;
  buttonLabel?: string;
};

export function SearchBox({ placeholder, buttonLabel = "Buscar" }: SearchBoxProps) {
  return (
    <div className="search-box">
      <Search className="search-icon" size={26} />
      <input placeholder={placeholder} />
      <button>{buttonLabel}</button>
    </div>
  );
}
