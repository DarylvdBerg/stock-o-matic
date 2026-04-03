package strings

import "strings"

// IsEmptyOrWhiteSpace returns true if the string is empty or contains only whitespace.
func IsEmptyOrWhiteSpace(s string) bool {
	return strings.TrimSpace(s) == ""
}
