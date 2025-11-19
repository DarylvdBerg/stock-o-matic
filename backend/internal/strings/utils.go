package strings

func IsEmptyOrWhiteSpace(s string) bool {
	return len(s) == 0 || s == " "
}
