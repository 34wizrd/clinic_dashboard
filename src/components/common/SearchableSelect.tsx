// src/components/common/SearchableSelect.tsx

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Defines the shape for each item in the select list.
 * The parent component must format its data to match this shape.
 */
export type SelectOption = {
    value: number;
    label: string;
};

/**
 * Defines the props required by the SearchableSelect component.
 */
interface SearchableSelectProps {
    /** An array of options to be displayed in the dropdown. */
    options: SelectOption[];
    /** The currently selected value (ID). */
    value?: number | null;
    /** A callback function that is invoked when an option is selected. */
    onSelect: (value: number) => void;
    /** The placeholder text to display when no value is selected. */
    placeholder?: string;
    /** The placeholder text for the search input inside the popover. */
    searchPlaceholder?: string;
}

/**
 * A reusable "Combobox" or searchable select component built with Shadcn UI.
 * It allows users to search and select from a list of options.
 */
export function SearchableSelect({
                                     options,
                                     value,
                                     onSelect,
                                     placeholder = "Select an option...",
                                     searchPlaceholder = "Search...",
                                 }: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const selectedLabel = options.find((option) => option.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {value ? selectedLabel : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onSelect(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}