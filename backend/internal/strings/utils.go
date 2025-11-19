package strings

import (
	"regexp"
	"strings"
)

func IsEmptyOrWhiteSpace(s string) bool {
	s = strings.ReplaceAll(s, " ", "")
	empty := s == ""
	whitespace := regexp.MustCompile(`\s+`).MatchString(s)
	return empty || whitespace
}
