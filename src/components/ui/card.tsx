type CardProps = { children: React.ReactNode; className?: string; hover?: boolean; elevated?: boolean };
export function Card({ children, className = "", hover = true, elevated = false }: CardProps) {
  return (
    <div className={`${elevated ? "card-elevated" : "card-base"} ${hover ? "hover:border-[#7850ff]/20" : ""} ${className}`}>
      {children}
    </div>
  );
}