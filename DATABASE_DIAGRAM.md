# Database Schema Diagram

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : has
    User ||--|| Profile : has
    User ||--|| Settings : has
    User ||--o{ Category : has
    User ||--o{ JournalEntry : has

    User {
        string id PK
        string name
        string email UK
        datetime emailVerified
        string image
        string password
        datetime createdAt
        datetime updatedAt
    }

    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    Profile {
        string id PK
        string userId FK
        string bio
        string location
        string website
        datetime createdAt
        datetime updatedAt
    }

    Settings {
        string id PK
        string userId FK 
        string theme
        boolean emailNotifications
        datetime createdAt
        datetime updatedAt
    }

    Category {
        string id PK
        string name
        string color
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    JournalEntry {
        string id PK
        string title
        string content
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    EntryMetadata {
        string id PK
        string entryId FK 
        int wordCount
        int readingTime
        json sentiment
        datetime createdAt
        datetime updatedAt
    }

    JournalEntry ||--|| EntryMetadata : has
    JournalEntry }o--o{ Category : belongs_to
``` 