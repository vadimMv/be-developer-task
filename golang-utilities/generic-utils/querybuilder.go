package genericutils

import (
	"fmt"
	"strings"
)

// QueryBuilder provides a fluent interface for building SQL queries
// Not inherently concurrent but can be used safely if each goroutine has its own instance
type QueryBuilder struct {
	selectedFields []string
	whereConditions []string
	orderByClause  string
	limitClause    string
	tableName      string
}

// NewQueryBuilder creates a new QueryBuilder with an optional table name
func NewQueryBuilder(tableName ...string) *QueryBuilder {
	name := "table"
	if len(tableName) > 0 && tableName[0] != "" {
		name = tableName[0]
	}

	return &QueryBuilder{
		selectedFields: make([]string, 0),
		whereConditions: make([]string, 0),
		tableName:      name,
	}
}

// Select specifies which fields to select
func (qb *QueryBuilder) Select(fields ...string) *QueryBuilder {
	qb.selectedFields = append(qb.selectedFields, fields...)
	return qb
}

// Where adds WHERE conditions to the query
// Accepts field-value pairs as alternating arguments: field1, value1, field2, value2, ...
func (qb *QueryBuilder) Where(conditions ...interface{}) *QueryBuilder {
	if len(conditions)%2 != 0 {
		// Invalid number of arguments, skip
		return qb
	}

	for i := 0; i < len(conditions); i += 2 {
		field := fmt.Sprintf("%v", conditions[i])
		value := conditions[i+1]

		var condition string
		switch v := value.(type) {
		case string:
			condition = fmt.Sprintf("%s = '%s'", field, v)
		case int, int32, int64, float32, float64:
			condition = fmt.Sprintf("%s = %v", field, v)
		default:
			condition = fmt.Sprintf("%s = %v", field, v)
		}

		qb.whereConditions = append(qb.whereConditions, condition)
	}

	return qb
}

// WhereMap adds WHERE conditions from a map
func (qb *QueryBuilder) WhereMap(conditions map[string]interface{}) *QueryBuilder {
	for field, value := range conditions {
		var condition string
		switch v := value.(type) {
		case string:
			condition = fmt.Sprintf("%s = '%s'", field, v)
		case int, int32, int64, float32, float64:
			condition = fmt.Sprintf("%s = %v", field, v)
		default:
			condition = fmt.Sprintf("%s = %v", field, v)
		}
		qb.whereConditions = append(qb.whereConditions, condition)
	}
	return qb
}

// OrderBy adds an ORDER BY clause
func (qb *QueryBuilder) OrderBy(field string, direction string) *QueryBuilder {
	dir := strings.ToUpper(direction)
	if dir != "ASC" && dir != "DESC" {
		dir = "ASC"
	}
	qb.orderByClause = fmt.Sprintf("ORDER BY %s %s", field, dir)
	return qb
}

// Limit adds a LIMIT clause
func (qb *QueryBuilder) Limit(count int) *QueryBuilder {
	qb.limitClause = fmt.Sprintf("LIMIT %d", count)
	return qb
}

// From sets the table name
func (qb *QueryBuilder) From(name string) *QueryBuilder {
	qb.tableName = name
	return qb
}

// Build constructs and returns the final SQL query string
func (qb *QueryBuilder) Build() string {
	parts := make([]string, 0, 5)

	// SELECT clause
	if len(qb.selectedFields) > 0 {
		parts = append(parts, "SELECT "+strings.Join(qb.selectedFields, ", "))
	} else {
		parts = append(parts, "SELECT *")
	}

	// FROM clause
	parts = append(parts, "FROM "+qb.tableName)

	// WHERE clause
	if len(qb.whereConditions) > 0 {
		parts = append(parts, "WHERE "+strings.Join(qb.whereConditions, " AND "))
	}

	// ORDER BY clause
	if qb.orderByClause != "" {
		parts = append(parts, qb.orderByClause)
	}

	// LIMIT clause
	if qb.limitClause != "" {
		parts = append(parts, qb.limitClause)
	}

	return strings.Join(parts, " ")
}

// Reset clears all query components and returns the builder to initial state
func (qb *QueryBuilder) Reset() *QueryBuilder {
	qb.selectedFields = make([]string, 0)
	qb.whereConditions = make([]string, 0)
	qb.orderByClause = ""
	qb.limitClause = ""
	return qb
}

// Clone creates a copy of the query builder
func (qb *QueryBuilder) Clone() *QueryBuilder {
	clone := &QueryBuilder{
		selectedFields:  make([]string, len(qb.selectedFields)),
		whereConditions: make([]string, len(qb.whereConditions)),
		orderByClause:   qb.orderByClause,
		limitClause:     qb.limitClause,
		tableName:       qb.tableName,
	}

	copy(clone.selectedFields, qb.selectedFields)
	copy(clone.whereConditions, qb.whereConditions)

	return clone
}
