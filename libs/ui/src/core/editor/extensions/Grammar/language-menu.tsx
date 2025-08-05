import { Button } from "../../../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../ui/dropdown-menu";

interface Props {
  message: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function LanguageIssueMenu({ message, suggestions, onSelect }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {message}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2 bg-white border rounded shadow-md">
        {suggestions.map((sug, idx) => (
          <DropdownMenuItem
            key={idx}
            onSelect={() => onSelect(sug)}
            className="p-2 cursor-pointer hover:bg-gray-100"
          >
            {sug}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
