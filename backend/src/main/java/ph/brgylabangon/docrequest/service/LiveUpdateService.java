package ph.brgylabangon.docrequest.service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Live updates (Server-Sent Events), the Spring Boot version of Firebase's real-time listeners.
 * Every open page keeps one connection to GET /api/live. When something changes, publish(...)
 * sends a short message ("requests" or "announcements") down every connection, and the pages reload.
 * The message carries no personal data, only WHAT kind of thing changed.
 */
@Service
public class LiveUpdateService {

    /** A connection is closed after 30 minutes; the browser reconnects by itself. */
    private static final long TIMEOUT_MS = 30 * 60 * 1000L;

    private final List<SseEmitter> connections = new CopyOnWriteArrayList<>();

    /** Called by LiveUpdateController when a page opens a connection. */
    public SseEmitter connect() {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        connections.add(emitter);
        emitter.onCompletion(() -> connections.remove(emitter));
        emitter.onTimeout(emitter::complete);
        emitter.onError(e -> connections.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            connections.remove(emitter);
        }
        return emitter;
    }

    /**
     * Tells every open page that something changed. topic = "requests" or "announcements".
     * Inside a @Transactional method, the message is sent only after the change is saved,
     * so the pages never reload too early and get the old data.
     */
    public void publish(String topic) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendToAll(topic);
                }
            });
        } else {
            sendToAll(topic);
        }
    }

    private void sendToAll(String topic) {
        for (SseEmitter emitter : connections) {
            try {
                emitter.send(SseEmitter.event().name(topic).data("changed"));
            } catch (IOException | IllegalStateException e) {
                connections.remove(emitter); // that page was closed
            }
        }
    }
}
