package genericutils

import (
	"fmt"
	"reflect"
)

// ValidationResult represents the result of a validation
type ValidationResult[T any] struct {
	Success bool
	Data    T
	Errors  []string
}

// Validator is a function that validates a value
type Validator[T any] func(value interface{}) ValidationResult[T]

// String creates a validator for string values
func String() Validator[string] {
	return func(value interface{}) ValidationResult[string] {
		if str, ok := value.(string); ok {
			return ValidationResult[string]{
				Success: true,
				Data:    str,
				Errors:  nil,
			}
		}
		return ValidationResult[string]{
			Success: false,
			Data:    "",
			Errors:  []string{"Expected string"},
		}
	}
}

// Number creates a validator for numeric values (int, int64, float64)
func Number() Validator[float64] {
	return func(value interface{}) ValidationResult[float64] {
		switch v := value.(type) {
		case int:
			return ValidationResult[float64]{Success: true, Data: float64(v)}
		case int32:
			return ValidationResult[float64]{Success: true, Data: float64(v)}
		case int64:
			return ValidationResult[float64]{Success: true, Data: float64(v)}
		case float32:
			return ValidationResult[float64]{Success: true, Data: float64(v)}
		case float64:
			return ValidationResult[float64]{Success: true, Data: v}
		default:
			return ValidationResult[float64]{
				Success: false,
				Data:    0,
				Errors:  []string{"Expected number"},
			}
		}
	}
}

// Integer creates a validator for integer values
func Integer() Validator[int] {
	return func(value interface{}) ValidationResult[int] {
		switch v := value.(type) {
		case int:
			return ValidationResult[int]{Success: true, Data: v}
		case int32:
			return ValidationResult[int]{Success: true, Data: int(v)}
		case int64:
			return ValidationResult[int]{Success: true, Data: int(v)}
		case float64:
			if v == float64(int(v)) {
				return ValidationResult[int]{Success: true, Data: int(v)}
			}
		}
		return ValidationResult[int]{
			Success: false,
			Data:    0,
			Errors:  []string{"Expected integer"},
		}
	}
}

// Boolean creates a validator for boolean values
func Boolean() Validator[bool] {
	return func(value interface{}) ValidationResult[bool] {
		if b, ok := value.(bool); ok {
			return ValidationResult[bool]{
				Success: true,
				Data:    b,
				Errors:  nil,
			}
		}
		return ValidationResult[bool]{
			Success: false,
			Data:    false,
			Errors:  []string{"Expected boolean"},
		}
	}
}

// Array creates a validator for array/slice values with item validation
func Array[T any](itemValidator Validator[T]) Validator[[]T] {
	return func(value interface{}) ValidationResult[[]T] {
		rv := reflect.ValueOf(value)
		if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
			return ValidationResult[[]T]{
				Success: false,
				Data:    nil,
				Errors:  []string{"Expected array"},
			}
		}

		results := make([]T, 0, rv.Len())
		errors := make([]string, 0)

		for i := 0; i < rv.Len(); i++ {
			item := rv.Index(i).Interface()
			result := itemValidator(item)
			if result.Success {
				results = append(results, result.Data)
			} else {
				errors = append(errors, fmt.Sprintf("Item at index %d: %v", i, result.Errors))
			}
		}

		if len(errors) > 0 {
			return ValidationResult[[]T]{
				Success: false,
				Data:    nil,
				Errors:  errors,
			}
		}

		return ValidationResult[[]T]{
			Success: true,
			Data:    results,
			Errors:  nil,
		}
	}
}

// Object creates a validator for struct/map objects
func Object[T any](validators map[string]Validator[interface{}]) Validator[T] {
	return func(value interface{}) ValidationResult[T] {
		rv := reflect.ValueOf(value)
		var zero T

		// Handle maps
		if rv.Kind() == reflect.Map {
			errors := make([]string, 0)

			for field, validator := range validators {
				mapValue := rv.MapIndex(reflect.ValueOf(field))
				if !mapValue.IsValid() {
					errors = append(errors, fmt.Sprintf("Field '%s': missing", field))
					continue
				}

				result := validator(mapValue.Interface())
				if !result.Success {
					errors = append(errors, fmt.Sprintf("Field '%s': %v", field, result.Errors))
				}
			}

			if len(errors) > 0 {
				return ValidationResult[T]{
					Success: false,
					Data:    zero,
					Errors:  errors,
				}
			}

			// Try to convert to T
			if typedValue, ok := value.(T); ok {
				return ValidationResult[T]{
					Success: true,
					Data:    typedValue,
					Errors:  nil,
				}
			}
		}

		// Handle structs
		if rv.Kind() == reflect.Struct || (rv.Kind() == reflect.Ptr && rv.Elem().Kind() == reflect.Struct) {
			if rv.Kind() == reflect.Ptr {
				rv = rv.Elem()
			}

			errors := make([]string, 0)

			for field := range validators {
				fieldValue := rv.FieldByName(field)
				if !fieldValue.IsValid() {
					errors = append(errors, fmt.Sprintf("Field '%s': not found", field))
				}
			}

			if len(errors) > 0 {
				return ValidationResult[T]{
					Success: false,
					Data:    zero,
					Errors:  errors,
				}
			}

			// Try to convert to T
			if typedValue, ok := value.(T); ok {
				return ValidationResult[T]{
					Success: true,
					Data:    typedValue,
					Errors:  nil,
				}
			}
		}

		return ValidationResult[T]{
			Success: false,
			Data:    zero,
			Errors:  []string{"Expected object"},
		}
	}
}

// Optional creates a validator for optional values
func Optional[T any](validator Validator[T]) Validator[*T] {
	return func(value interface{}) ValidationResult[*T] {
		if value == nil {
			return ValidationResult[*T]{
				Success: true,
				Data:    nil,
				Errors:  nil,
			}
		}

		result := validator(value)
		if result.Success {
			return ValidationResult[*T]{
				Success: true,
				Data:    &result.Data,
				Errors:  nil,
			}
		}

		return ValidationResult[*T]{
			Success: false,
			Data:    nil,
			Errors:  result.Errors,
		}
	}
}

// Literal creates a validator for specific literal values
func Literal[T comparable](literal T) Validator[T] {
	return func(value interface{}) ValidationResult[T] {
		if v, ok := value.(T); ok && v == literal {
			return ValidationResult[T]{
				Success: true,
				Data:    v,
				Errors:  nil,
			}
		}
		return ValidationResult[T]{
			Success: false,
			Data:    literal,
			Errors:  []string{fmt.Sprintf("Expected literal value: %v", literal)},
		}
	}
}

// Union creates a validator that tries multiple validators
func Union[T any](validators ...Validator[T]) Validator[T] {
	return func(value interface{}) ValidationResult[T] {
		errors := make([]string, 0)

		for _, validator := range validators {
			result := validator(value)
			if result.Success {
				return result
			}
			errors = append(errors, result.Errors...)
		}

		var zero T
		return ValidationResult[T]{
			Success: false,
			Data:    zero,
			Errors:  append([]string{"No union variant matched"}, errors...),
		}
	}
}

// Refine creates a validator with an additional predicate
func Refine[T any](validator Validator[T], predicate func(T) bool, errorMessage string) Validator[T] {
	return func(value interface{}) ValidationResult[T] {
		result := validator(value)
		if !result.Success {
			return result
		}

		if !predicate(result.Data) {
			return ValidationResult[T]{
				Success: false,
				Data:    result.Data,
				Errors:  []string{errorMessage},
			}
		}

		return result
	}
}

// MinLength creates a string validator with minimum length
func MinLength(min int) Validator[string] {
	return Refine(String(), func(s string) bool {
		return len(s) >= min
	}, fmt.Sprintf("String must be at least %d characters", min))
}

// MaxLength creates a string validator with maximum length
func MaxLength(max int) Validator[string] {
	return Refine(String(), func(s string) bool {
		return len(s) <= max
	}, fmt.Sprintf("String must be at most %d characters", max))
}

// Min creates a number validator with minimum value
func Min(min float64) Validator[float64] {
	return Refine(Number(), func(n float64) bool {
		return n >= min
	}, fmt.Sprintf("Number must be at least %v", min))
}

// Max creates a number validator with maximum value
func Max(max float64) Validator[float64] {
	return Refine(Number(), func(n float64) bool {
		return n <= max
	}, fmt.Sprintf("Number must be at most %v", max))
}

// Email creates a basic email validator
func Email() Validator[string] {
	return Refine(String(), func(s string) bool {
		// Simple email validation
		return len(s) > 0 && containsChar(s, '@') && containsChar(s, '.')
	}, "Invalid email format")
}

func containsChar(s string, c rune) bool {
	for _, ch := range s {
		if ch == c {
			return true
		}
	}
	return false
}
