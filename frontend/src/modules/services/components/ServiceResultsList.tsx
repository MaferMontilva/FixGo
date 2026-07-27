import { ArrowRight } from "lucide-react";
import type { ApiService } from "../types/service";

type ServiceResultsListProps = {
  services: ApiService[];
  onSelect: (service: ApiService) => void;
};

export function ServiceResultsList({ services, onSelect }: ServiceResultsListProps) {
  if (!services.length) return null;

  return (
    <div className="service-result-list">
      {services.map((service) => (
        <button key={service.id} onClick={() => onSelect(service)}>
          <span>
            <strong>{service.name}</strong>
            <small>{service.category.name}</small>
          </span>
          <ArrowRight size={16} />
        </button>
      ))}
    </div>
  );
}
