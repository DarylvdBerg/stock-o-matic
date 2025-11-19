package strings_test

import (
	"testing"

	"github.com/DarylvdBerg/stock-o-matic/internal/strings"
	"github.com/stretchr/testify/assert"
)

func TestIsEmptyOrWhiteSpace_Empty_True(t *testing.T) {
	s := ""
	ok := strings.IsEmptyOrWhiteSpace(s)

	assert.True(t, ok)
}

func TestIsEmptyOrWhiteSpace_Whitespace_True(t *testing.T) {
	s := " "
	ok := strings.IsEmptyOrWhiteSpace(s)

	assert.True(t, ok)
}

func TestIsEmptyOrWhiteSpace_MultipleWhiteSpace_True(t *testing.T) {
	s := "         "
	ok := strings.IsEmptyOrWhiteSpace(s)

	assert.True(t, ok)
}

func TestIsEmptyOrWhiteSpace_MultipleWhiteSpace_With_Words_False(t *testing.T) {
	s := "    Word   "
	ok := strings.IsEmptyOrWhiteSpace(s)

	assert.False(t, ok)
}

func TestIsEmptyOrWhiteSpace_Valid_False(t *testing.T) {
	s := "valid"
	ok := strings.IsEmptyOrWhiteSpace(s)

	assert.False(t, ok)
}
