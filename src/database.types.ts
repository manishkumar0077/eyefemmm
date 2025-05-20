// Add the csm_doctor_treatments_1 table to the database schema
// Look for the Tables interface and add the new table definition

// Example:
// export interface Database {
//   public: {
//     Tables: {
//       csm_doctor_treatments_1: {
//         Row: {
//           id: string
//           title: string
//           description: string | null
//           bullet_points: string[] | null
//           button_text: string | null
//           created_at: string
//         }
//         Insert: {
//           id?: string
//           title: string
//           description?: string | null
//           bullet_points?: string[] | null
//           button_text?: string | null
//           created_at?: string
//         }
//         Update: {
//           id?: string
//           title?: string
//           description?: string | null
//           bullet_points?: string[] | null
//           button_text?: string | null
//           created_at?: string
//         }
//       }
//       // other tables...
//     }
//   }
// } 