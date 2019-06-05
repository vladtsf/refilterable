export interface FilterConfig<T> {
	parse?(input: string): T; 
  format?(page: T): string; 
  validate(input: string, parse: (input: string) => T): boolean;
  defaultValue: T
};