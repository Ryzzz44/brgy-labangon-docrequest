# Entity Relationship Diagram

MySQL database `brgy_labangon`. Tables are created by Hibernate from the classes in
`backend/src/main/java/ph/brgylabangon/docrequest/entity/`.

```mermaid
erDiagram
    RESIDENT ||--o{ DOCUMENT_REQUEST : "submits"
    DOCUMENT_REQUEST ||--|{ TRANSACTION_HISTORY : "is logged in"
    STAFF ||--o{ ANNOUNCEMENT : "posts"

    RESIDENT {
        BIGINT id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR address
        VARCHAR contact_number
        LONGTEXT valid_id_image
        VARCHAR consent_version
        DATETIME consent_at
        DATETIME created_at
    }
    STAFF {
        BIGINT id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR position
        DATETIME created_at
    }
    DOCUMENT_REQUEST {
        BIGINT id PK
        VARCHAR reference_number UK
        BIGINT resident_id FK
        VARCHAR document_type
        VARCHAR purpose
        LONGTEXT valid_id_image
        VARCHAR status
        VARCHAR rejection_reason
        VARCHAR resident_seen_status
        BIT seen_by_staff
        BIT archived_by_resident
        BIT deleted_by_resident
        DATETIME created_at
        DATETIME updated_at
    }
    TRANSACTION_HISTORY {
        BIGINT id PK
        BIGINT request_id FK
        VARCHAR actor_name
        VARCHAR actor_role
        VARCHAR action_type
        VARCHAR remarks
        DATETIME timestamp
    }
    ANNOUNCEMENT {
        BIGINT id PK
        VARCHAR title
        VARCHAR message
        VARCHAR level
        BIT active
        BIGINT staff_id FK
        DATETIME created_at
        DATETIME expires_at
    }
```

## Relationships

| Relationship | Type | Foreign key |
|---|---|---|
| A resident submits document requests | 1 to many (0..*) | `document_request.resident_id` -> `resident.id` |
| A request is logged in the transaction history | 1 to many (1..*) | `transaction_history.request_id` -> `document_request.id` |
| A staff member posts announcements | 1 to many (0..*) | `announcement.staff_id` -> `staff.id` |

## Allowed values

- `document_request.status`: PENDING, PROCESSED, READY_FOR_PICKUP, RELEASED, REJECTED, CANCELLED
- `announcement.level`: URGENT, IMPORTANT, INFO
- `transaction_history.action_type`: SUBMITTED, UPDATED, CANCELLED, PROCESSED, READY_FOR_PICKUP, RELEASED, REJECTED

To draw it for the documentation: MySQL Workbench > Database > Reverse Engineer > pick `brgy_labangon`.
