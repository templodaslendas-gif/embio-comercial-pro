import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface PremiumTableColumn<T> {
  key: string;
  label: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
}

interface PremiumTableProps<T> {
  columns: PremiumTableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function PremiumTable<T>({
  columns,
  rows,
  keyExtractor,
  loading = false,
  skeletonRows = 5,
  emptyState,
  className,
  onRowClick,
}: PremiumTableProps<T>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-hidden shadow-sm",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border/30 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs uppercase tracking-wider text-muted-foreground",
                  col.headerClassName,
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i} className="border-border/20">
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-52 text-center">
                {emptyState ?? (
                  <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className={cn(
                  "border-border/20 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/20",
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
