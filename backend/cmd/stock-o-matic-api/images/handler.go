package images

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	maxUploadSize    = 5 << 20 // 5MB
	uploadsDir       = "./uploads"
	filenameRandSize = 16
)

type uploadResponse struct {
	URL string `json:"url"`
}

// NewUploadHandler returns an HTTP handler that accepts image uploads
// via multipart form data and saves them to the local filesystem.
// Also handles DELETE requests to remove uploaded images.
func NewUploadHandler() http.Handler {
	_ = os.MkdirAll(uploadsDir, os.ModePerm)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handleUpload(w, r)
		case http.MethodDelete:
			handleDelete(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		http.Error(w, "file too large", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "missing image field", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed[ext] {
		http.Error(w, "unsupported file type", http.StatusBadRequest)
		return
	}

	filename, err := randomFilename(ext)
	if err != nil {
		http.Error(w, "failed to generate filename", http.StatusInternalServerError)
		return
	}

	dst, err := os.Create(filepath.Join(uploadsDir, filename))
	if err != nil {
		http.Error(w, "failed to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "failed to save file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(uploadResponse{URL: "/uploads/" + filename})
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		http.Error(w, "missing url parameter", http.StatusBadRequest)
		return
	}

	// Extract filename from URL path like "/uploads/abc123.jpg"
	filename := filepath.Base(url)
	if filename == "." || filename == "/" {
		http.Error(w, "invalid url", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(uploadsDir, filename)

	// Prevent directory traversal
	if filepath.Dir(filePath) != uploadsDir {
		http.Error(w, "invalid url", http.StatusBadRequest)
		return
	}

	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		http.Error(w, "failed to delete file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// NewFileServer returns an HTTP handler that serves uploaded files.
func NewFileServer() http.Handler {
	_ = os.MkdirAll(uploadsDir, os.ModePerm)
	return http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir)))
}

func randomFilename(ext string) (string, error) {
	b := make([]byte, filenameRandSize)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generating random bytes: %w", err)
	}
	return hex.EncodeToString(b) + ext, nil
}
