import { resolveAvatar, initialsFromName } from "@/lib/avatares";
import { cn } from "@/lib/utils";

interface Props {
  avatarId?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const UserAvatar = ({ avatarId, name, size = "md", className }: Props) => {
  const src = resolveAvatar(avatarId);
  const initials = initialsFromName(name);
  return (
    <div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/15 font-bold text-primary", sizeMap[size], className)}>
      {src ? (
        <img src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default UserAvatar;
