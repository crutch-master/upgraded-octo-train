package util

import (
	"crypto/rand"
	"encoding/base64"
)

// Always returns a string of length 4 * `count`.
func RandomBase64(count int) string {
	// `count` * 3 * 8 bits / 6 bits/symbol = 4 * `count` symbols
	b := make([]byte, count*3)
	rand.Read(b)

	return base64.StdEncoding.EncodeToString(b[:])
}
