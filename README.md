# 🧠 Focal AI - AI-Powered Product Requirements Generation

**Transform your product ideas into comprehensive, stakeholder-validated Product Requirements Documents (PRDs) using intelligent multi-agent AI debate.**

## 🎯 **What is Focal AI?**

Focal AI is an intelligent platform that simulates real-world **leadership stakeholder discussions** to generate comprehensive Product Requirements Documents. Instead of a single AI perspective, it orchestrates a **5-agent debate system** representing different **leadership viewpoints** and strategic perspectives:

- **Product Manager** 🎯 - Focuses on product vision, strategy, feature prioritization, and roadmap
- **Design Lead** 🎨 - Prioritizes usability, aesthetics, user experience, and accessibility
- **Engineering Lead** ⚙️ - Considers technical feasibility, architecture, scalability, and development timeline
- **Marketing & Sales Head** 📈 - Focuses on market positioning, customer acquisition, and go-to-market strategy
- **Business Manager** 💼 - Analyzes profitability, scalability, revenue model, and long-term sustainability

## 🚀 **How It Works**

### **1. Idea Input & Processing**
```
User submits idea → AI analyzes context → Multi-agent debate begins
```

### **2. Multi-Round AI Debate**
- **Initial Debate**: 3 rounds of discussion between all 5 agents
- **Context Building**: Each round builds on previous responses
- **Perspective Integration**: Agents consider each other's viewpoints

### **3. PRD Generation**
- **10-Section Structure**: Comprehensive PRD with industry-standard sections
- **Stakeholder Consensus**: Final document reflects balanced perspectives
- **Actionable Output**: Ready-to-use requirements for development teams

### **4. Iterative Refinement**
- **Feedback Integration**: Users can provide feedback on generated PRDs
- **Continuous Improvement**: AI refines requirements based on user input
- **Version History**: Track all iterations and improvements

## 🏗️ **System Architecture**

### **Backend (Django + MongoDB)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Django API    │───▶│ Multi-Agent     │───▶│  Gemini AI      │
│   (Views)       │    │ System          │    │  (LangChain)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  MongoDB        │    │  API Quota      │    │  Fallback       │
│  Service        │    │  Management     │    │  Responses      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Frontend (Next.js + NextAuth)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NextAuth      │───▶│  User Context   │───▶│  Dashboard      │
│   (Google OAuth)│    │  & State        │    │  Components     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Authentication │    │  Credit System  │    │  Analytics      │
│  Flow           │    │  Management     │    │  Dashboard      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Key Components**

### **1. Multi-Agent System (`backend/api/services/multi_agent.py`)**
```python
class MultiAgentSystem:
    def __init__(self):
        self.agents = {
            'product_manager': Product Manager persona,
            'design_lead': Design Lead persona,
            'engineering_lead': Engineering Lead persona,
            'marketing_sales_head': Marketing & Sales Head persona,
            'business_manager': Business Manager persona
        }
    
    def run_debate(self, idea, rounds=3):
        # Orchestrates multi-round debate between agents
        
    def aggregate_results(self, idea, debate_log):
        # Generates 10-section PRD from debate outcomes
```

**Features:**
- **Configurable Rounds**: Default 3 rounds for initial debate, 2 for feedback
- **Context Building**: Each round considers previous responses
- **API Quota Management**: Prevents quota exhaustion with fallback responses
- **Fallback System**: Graceful degradation when API limits are reached

### **2. PRD Generation Engine**
The system generates comprehensive PRDs with these 10 sections:

1. **Overview** - Product vision and purpose
2. **Problem Statement** - Pain points and value proposition
3. **Debate Summary** - Stakeholder perspectives and consensus
4. **Objectives** - High-level goals and success criteria
5. **Scope** - In-scope and out-of-scope features
6. **Requirements** - Functional and non-functional requirements
7. **User Stories** - End-user perspective requirements
8. **Trade-offs & Decisions** - Compromises and prioritization
9. **Next Steps** - Actionable implementation roadmap
10. **Success Metrics** - KPIs and measurement criteria

### **3. Analytics Dashboard**
**5 Comprehensive Chart Components:**

- **ChartsDisplay** 📊 - Main debate visualization
- **AgentWorkloadChart** 👥 - Leadership agent participation and activity
- **ResponseMetricsChart** 📈 - Response quality and length analysis
- **IterationProgressChart** 🔄 - Feedback iteration tracking
- **StakeholderAlignmentChart** 🤝 - Leadership consensus and alignment scoring

**Layout Features:**
- **Full-Width Analytics**: Separated from centered PRD content
- **Flexbox Chart Grid**: Efficient space utilization without gaps
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects and animations

### **4. Credit System & User Management**
- **Initial Credits**: 10 credits upon account creation
- **Cost Structure**: 2 credits per requirement refinement
- **Transaction Tracking**: Complete history of credit usage
- **User Profiles**: Persistent user data and preferences

### **5. PDF Export System**
- **Professional Formatting**: Clean, structured PDF output
- **Complete Content**: Includes PRD, debate log, and analytics
- **Custom Styling**: Branded document appearance
- **Download Ready**: Instant PDF generation and download

## 🔄 **Complete Workflow**

### **Phase 1: Initial Requirements Generation**
```
1. User Authentication (Google OAuth)
2. Credit Verification (Minimum 2 credits required)
3. Idea Submission (Text input with context)
4. Multi-Agent Debate (3 rounds × 5 leadership agents = 15 AI responses)
5. PRD Generation (10-section structured document)
6. Results Display (Formatted PRD + Analytics Dashboard)
7. Credit Deduction (2 credits deducted)
```

### **Phase 2: Iterative Refinement**
```
1. User Feedback Submission (Free, no credits required)
2. Feedback Analysis (AI processes user input)
3. Refined Debate (2 rounds × 5 leadership agents = 10 AI responses)
4. Updated PRD (Incorporates user feedback)
5. New Iteration Display (Shows improvement over previous version)
6. Iteration History (Track all feedback cycles)
```

### **Phase 3: Analytics & Insights**
```
1. Real-time Data Processing (Debate metrics and agent activity)
2. Chart Generation (5 different visualization types)
3. Performance Metrics (Response quality, agent workload)
4. Stakeholder Alignment (Consensus scoring and analysis)
5. Export Capabilities (PDF, data export)
```

## 🛠️ **Technology Stack**

### **Backend Technologies**
- **Framework**: Django 4.2 (Python web framework)
- **Database**: MongoDB (NoSQL document database)
- **AI Integration**: Google Gemini 1.5 Flash via LangChain
- **Authentication**: Google OAuth 2.0
- **API**: RESTful API with CORS support
- **Dependencies**: See `backend/requirements.txt`

### **Frontend Technologies**
- **Framework**: Next.js 15.5 (React-based framework)
- **Authentication**: NextAuth.js with Google provider
- **State Management**: React Context API
- **UI Library**: Tailwind CSS + Framer Motion
- **Charts**: Chart.js + React Chart.js 2
- **PDF Generation**: @react-pdf/renderer
- **Dependencies**: See `frontend/package.json`

### **AI & ML Components**
- **Language Model**: Google Gemini 1.5 Flash
- **Orchestration**: LangChain framework
- **Prompt Engineering**: Structured prompts for consistent output
- **Context Management**: Multi-turn conversation handling
- **Fallback Systems**: Graceful degradation when AI services are unavailable

## 📊 **Data Models & Schema**

### **Core Collections (MongoDB)**
```javascript
// Users Collection
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  avatar: String,
  credits: Number,
  created_at: DateTime,
  updated_at: DateTime
}

// Ideas Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  description: String,
  created_at: DateTime,
  updated_at: DateTime
}

// Debates Collection
{
  _id: ObjectId,
  idea_id: ObjectId,
  round_number: Number,
  agent_name: String, // Product Manager, Design Lead, Engineering Lead, Marketing & Sales Head, Business Manager
  message: String,
  timestamp: DateTime
}

// Requirements Collection
{
  _id: ObjectId,
  idea_id: ObjectId,
  prd_content: String,
  sections: Object (10 PRD sections),
  debate_log: Array,
  created_at: DateTime
}

// Credit Transactions Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  amount: Number,
  type: String,
  description: String,
  timestamp: DateTime
}
```

## 🚀 **Getting Started**

### **Prerequisites**
- **Python 3.8+** and **Node.js 18+**
- **MongoDB Atlas** account or local MongoDB instance
- **Google Cloud Console** project with OAuth 2.0 credentials
- **Google AI Studio** account for Gemini API access

### **1. Clone & Setup**
```bash
git clone <repository-url>
cd focal_ai

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### **2. Environment Configuration**
```bash
# Backend (.env)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=focal_ai
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key

# Frontend (.env.local)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### **3. Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev
```

### **4. Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 🔐 **Authentication & Security**

### **OAuth Flow**
1. **User clicks "Sign in with Google"**
2. **Google OAuth consent screen appears**
3. **User grants permissions**
4. **Frontend receives authorization code**
5. **NextAuth exchanges code for tokens**
6. **Backend verifies tokens with Google**
7. **User session established with JWT**

### **Security Features**
- **HTTPS enforcement** in production
- **CORS configuration** for API access
- **Token validation** on every API request
- **Credit verification** before processing
- **Rate limiting** to prevent abuse

## 📈 **Performance & Scalability**

### **Current Optimizations**
- **MongoDB indexing** for fast queries
- **Connection pooling** for database efficiency
- **API quota management** to prevent service degradation
- **Fallback responses** for graceful degradation
- **Lazy loading** for chart components

### **Scalability Considerations**
- **Horizontal scaling** with multiple Django instances
- **Database sharding** for large datasets
- **CDN integration** for static assets
- **Load balancing** for high traffic
- **Caching layers** (Redis) for frequently accessed data

## 🧪 **Testing & Quality Assurance**

### **Testing Strategy**
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing

### **Quality Metrics**
- **Code Coverage**: Target 80%+ coverage
- **Performance**: <2s response time for PRD generation
- **Reliability**: 99.9% uptime target
- **Security**: Regular security audits

## 🚧 **Known Limitations & Considerations**

### **API Quota Constraints**
- **Google Gemini API** has rate limits
- **Fallback system** provides basic functionality when quota exceeded
- **Credit system** helps manage API usage costs

### **AI Model Limitations**
- **Context length** constraints for very long ideas
- **Response consistency** may vary between runs
- **Language support** currently English-focused

### **Scalability Considerations**
- **Single server** deployment for development
- **Database connections** need monitoring in production
- **File uploads** not yet implemented

## 🔮 **Future Roadmap**

### **Phase 1: Enhanced Analytics**
- **Real-time updates** with WebSocket integration
- **Custom metrics** and KPI tracking
- **Advanced visualizations** and dashboards

### **Phase 2: Advanced AI Features**
- **Multi-language support** for global users
- **Industry-specific templates** for different domains
- **Risk assessment** and mitigation strategies

### **Phase 3: Enterprise Features**
- **Team collaboration** and sharing
- **Version control** and change tracking
- **Integration APIs** for third-party tools

## 🤝 **Contributing**

### **Development Setup**
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request** with detailed description

### **Code Standards**
- **Python**: PEP 8 compliance
- **JavaScript/TypeScript**: ESLint configuration
- **Documentation**: Comprehensive docstrings and comments
- **Testing**: Unit tests for new features

## 📚 **Additional Resources**

### **Documentation Files**
- **SETUP.md**: Detailed setup and configuration guide
- **NEXT_STEPS.md**: Development roadmap and future plans
- **TESTING_GUIDE.md**: Testing procedures and best practices
- **QUOTA_GUIDE.md**: API quota management strategies

### **External Resources**
- **Google AI Studio**: https://aistudio.google.com/
- **MongoDB Atlas**: https://www.mongodb.com/atlas
- **Google Cloud Console**: https://console.cloud.google.com/
- **LangChain Documentation**: https://python.langchain.com/

## 🆘 **Support & Troubleshooting**

### **Common Issues**
1. **MongoDB Connection**: Check connection string and network access
2. **Google OAuth**: Verify client ID and secret configuration
3. **API Quota**: Monitor Gemini API usage and limits
4. **Authentication**: Clear browser cookies and re-authenticate

### **Getting Help**
1. **Check documentation** in this README and related files
2. **Review logs** for error messages and stack traces
3. **Verify configuration** of environment variables
4. **Open GitHub issue** with detailed problem description

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Google AI** for Gemini language model access
- **MongoDB** for scalable document database
- **LangChain** for AI orchestration framework
- **Next.js** for modern React framework
- **Tailwind CSS** for utility-first styling

---

**Built with ❤️ by the Focal AI Team**

*Transform your ideas into reality with intelligent stakeholder simulation.*