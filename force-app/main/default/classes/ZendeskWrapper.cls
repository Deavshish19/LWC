public class ZendeskWrapper {
	public ticket ticket;
	public class ticket {
		public comment comment;
		public String priority;	
		public String subject;	
		public requester requester;
	}
	public class comment {
		public String body;	
	}
	public class requester {
		public Integer locale_id;	
		public String name;	
		public String email;
	}
    
    public Class ZendeskUser {
        public Long id;
        public String name;
        public String email;
        public String role;
        public String phone;
        public Boolean active;
    }
}