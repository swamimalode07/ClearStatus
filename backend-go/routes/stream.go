package routes

import (
	"fmt"
	
	"sync"

	"github.com/gin-gonic/gin"
)

type sseClient struct {
	ch   chan string
	quit chan struct{}
}

type sseHub struct {
	clients map[*sseClient]struct{}
	lock    sync.Mutex
}

var hub = &sseHub{clients: make(map[*sseClient]struct{})}

func (h *sseHub) Add(c *sseClient) {
	h.lock.Lock()
	h.clients[c] = struct{}{}
	h.lock.Unlock()
}

func (h *sseHub) Remove(c *sseClient) {
	h.lock.Lock()
	delete(h.clients, c)
	h.lock.Unlock()
}

func (h *sseHub) Broadcast(msg string) {
	h.lock.Lock()
	for c := range h.clients {
		select {
		case c.ch <- msg:
		default:
		}
	}
	h.lock.Unlock()
}

// Call this from other handlers to broadcast updates
func BroadcastSSE(msg string) {
	hub.Broadcast(msg)
}

func RegisterStreamRoutes(rg *gin.RouterGroup) {
	rg.GET("/stream", sseStream)
}

func sseStream(c *gin.Context) {
	client := &sseClient{ch: make(chan string, 10), quit: make(chan struct{})}
	hub.Add(client)
	defer hub.Remove(client)

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Flush()

	notify := c.Writer.CloseNotify()
	for {
		select {
		case msg := <-client.ch:
			fmt.Fprintf(c.Writer, "data: %s\n\n", msg)
			c.Writer.Flush()
		case <-notify:
			return
		case <-client.quit:
			return
		}
	}
} 