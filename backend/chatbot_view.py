import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q
from listings.models import Listing
from orders.models import Order

class CampusChatbotView(APIView):
    """
    Intelligent Conversational CampusMart AI Assistant.
    Provides ChatGPT-like conversational responses, campus guidance,
    and real-time live database product discovery.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        raw_message = request.data.get('message', '').strip()
        if not raw_message:
            return Response({
                "reply": "👋 Hi there! I'm Marty, your 24/7 CampusMart AI Assistant. How can I help you today? You can ask about textbooks, lab gear, cycles, senior clearance deals, safe meetup spots, or how to buy and sell!",
                "suggestions": [
                    "🎓 Show Senior Deals",
                    "📚 CSE 3rd Sem Books",
                    "🧮 Casio Calculator",
                    "🚲 Campus Cycles",
                    "📍 Safe Meetup Points",
                    "💡 How to Sell an Item"
                ],
                "items": []
            })

        msg_lower = raw_message.lower()
        # Clean punctuation
        cleaned = re.sub(r'[^\w\s]', ' ', msg_lower)
        words = set(cleaned.split())

        # -------------------------------------------------------------
        # 1. Greetings & Small Talk (Conversational ChatGPT feel)
        # -------------------------------------------------------------
        greetings = {'hi', 'hello', 'hey', 'heyy', 'hiya', 'hola', 'namaste', 'yo', 'sup', 'morning', 'evening'}
        if words.intersection(greetings) and len(words) <= 3:
            return Response({
                "reply": "Hello! 👋 Great to see you! I'm Marty, your CampusMart AI companion. I'm here to help you find affordable textbooks, electronics, cycles, check senior clearance deals, or guide you through safe campus handovers. What are you looking for today?",
                "suggestions": [
                    "📚 Course Textbooks",
                    "🧮 Scientific Calculators",
                    "🚲 Cheap Cycles",
                    "🎓 Senior Deals",
                    "📍 Campus Meetup Points"
                ],
                "items": []
            })

        # How are you / status check
        if any(phrase in msg_lower for phrase in ['how are you', 'how r u', 'how are u', 'how do you do', 'sup marty']):
            return Response({
                "reply": "I'm doing great, thank you for asking! 😊 Powered up and ready to help you navigate campus deals. Are you looking to buy something for classes, or would you like to sell items from your dorm?",
                "suggestions": ["Browse All Listings", "How does COD work?", "Post a New Listing"],
                "items": []
            })

        # Who are you / Identity
        if any(phrase in msg_lower for phrase in ['who are you', 'who r u', 'what are you', 'what is campusmart', 'about campusmart']):
            return Response({
                "reply": "🎓 I'm **Marty**, your campus marketplace AI assistant! **CampusMart** is a verified peer-to-peer marketplace built exclusively for our college community. Students can buy and sell textbooks, electronics, cycles, and hostel essentials safely with Cash-on-Delivery at campus spots like Library Steps, Main Gate, and the Canteen.",
                "suggestions": ["Show Senior Deals", "Safety & Meetup Points", "Browse Catalog"],
                "items": []
            })

        # Gratitude
        if words.intersection({'thanks', 'thank', 'thx', 'ty', 'dhanyavadalu', 'shukriya'}):
            return Response({
                "reply": "You're very welcome! 😊 Always happy to assist a fellow campus student. Let me know if you need any more recommendations or have questions about your orders!",
                "suggestions": ["Check My Orders", "Browse Cycles", "Hostel Essentials"],
                "items": []
            })

        # Goodbye
        if words.intersection({'bye', 'goodbye', 'cya', 'later', 'see ya'}):
            return Response({
                "reply": "Goodbye! 🎓 Best of luck with your classes and semester exams. Catch you around campus!",
                "suggestions": ["Back to Home", "Browse Catalog"],
                "items": []
            })

        # -------------------------------------------------------------
        # 2. Campus Guide & How-To Workflows
        # -------------------------------------------------------------
        # How to Buy
        if any(phrase in msg_lower for phrase in ['how to buy', 'how do i buy', 'buying process', 'how does buying work', 'how to order']):
            return Response({
                "reply": "🛒 **How buying works on CampusMart in 3 easy steps:**\n\n1. **Browse & Add to Cart**: Find the textbook, gadget, or cycle you need.\n2. **Choose Meetup Location**: At checkout, select **Library Steps**, **Main Gate**, or **Canteen**.\n3. **Inspect & Pay Cash/UPI**: Meet the seller in person, check the condition thoroughly, and pay Cash-on-Delivery or UPI on the spot! Zero online payment risk.",
                "suggestions": ["Browse Listings", "Check Senior Deals", "Safe Meetup Spots"],
                "items": []
            })

        # How to Sell
        if any(phrase in msg_lower for phrase in ['how to sell', 'how do i sell', 'selling process', 'post listing', 'list an item', 'become a seller']):
            return Response({
                "reply": "💼 **Selling is super fast on CampusMart:**\n\n1. Log in with your campus account.\n2. Click **Seller Hub** in the navigation header.\n3. Click **Post New Listing** and enter title, category, branch, price, condition, and your hostel.\n4. When a student places an order, you'll see it in your **Orders to Hand Over** queue!\n5. Meet the buyer at the selected campus spot, hand over the item, and collect payment.",
                "suggestions": ["Go to Seller Hub", "Post New Listing", "View Sales Chart"],
                "items": []
            })

        # Safety & Payment / COD
        if any(phrase in msg_lower for phrase in ['safe', 'safety', 'cod', 'cash on delivery', 'payment', 'upi', 'scam', 'fraud']):
            return Response({
                "reply": "🛡️ **CampusMart Safety Guarantee:**\n\n• **100% Cash-on-Delivery / On-Handover UPI**: You never pay before physically inspecting the product.\n• **Verified Campus Meetup Points**: Handover takes place in public, well-lit spots (Library Steps, Main Gate, Canteen).\n• **Peer-to-Peer Trust**: Every listing is posted by an enrolled student or graduating senior.\n• **Inspection Right**: Always test electronics and check book pages before handing over money!",
                "suggestions": ["Safe Meetup Points", "Browse Listings", "Show Senior Deals"],
                "items": []
            })

        # Meetup points
        if any(w in msg_lower for w in ['meetup', 'meeting spot', 'library', 'gate', 'canteen', 'location', 'where to meet']):
            return Response({
                "reply": "📍 **Our 3 Verified Safe Campus Meetup Spots:**\n\n• 🏛️ **Library Steps**: Quiet, central academic zone—ideal for textbooks, calculators, and study notes.\n• 🚪 **Main Gate Campus Arch**: Wide open pavement with security presence—best for bicycle handovers and bulky dorm items.\n• ☕ **Student Canteen**: Casual, bustling daytime hub—grab a chai while inspecting gadgets, chargers, or lab kits!\n\nBoth buyer and seller receive the chosen meetup spot on their order receipt.",
                "suggestions": ["Where is my order?", "Browse Bicycles", "Scientific Calculators"],
                "items": []
            })

        # Order Statuses
        if any(w in msg_lower for w in ['status', 'tracking', 'shipped', 'delivered', 'placed', 'cancel order']):
            return Response({
                "reply": "📦 **CampusMart Order Stages:**\n\n• **Placed**: Order registered. Buyer can cancel if plans change.\n• **Shipped**: Seller has packed the item and is en route to your chosen meetup spot.\n• **Delivered**: Both parties met at the campus spot, item inspected, and payment completed!\n• **Cancelled**: Order cancelled by buyer or out-of-stock.\n\nCheck **My Orders** in the top navigation to track your active handovers in real time.",
                "suggestions": ["Go to My Orders", "Go to Cart", "Meetup Locations"],
                "items": []
            })

        # -------------------------------------------------------------
        # 3. Senior Deals Intent
        # -------------------------------------------------------------
        if any(w in msg_lower for w in ['senior', 'seniordeal', 'senior deal', 'graduating', 'clearance']):
            deals = Listing.objects.filter(is_senior_deal=True)[:4]
            serialized_deals = [
                {
                    "id": d.id,
                    "title": d.title,
                    "price": str(d.price),
                    "imageUrl": d.imageUrl,
                    "category": d.category,
                    "condition": d.condition,
                    "hostel": d.hostel,
                    "rating": d.rating,
                    "branch": d.branch
                } for d in deals
            ]
            deal_summary = ", ".join([f"**{d.title}** (₹{d.price})" for d in deals])
            return Response({
                "reply": f"🎓 **Senior-Only Clearance Deals** are heavily discounted items posted by graduating seniors moving out of hostels! They are priced to sell quickly before campus departure.\n\nTop current senior deals: {deal_summary}.\n\n*Note: Sign in with your campus student account to unlock direct ordering on these deals!*",
                "suggestions": ["Show All Senior Deals", "Engineering Mechanics (₹350)", "Arduino Starter Kit (₹750)"],
                "items": serialized_deals
            })

        # -------------------------------------------------------------
        # 4. Academic Branch & Semester Queries
        # -------------------------------------------------------------
        branches = {
            'cse': 'CSE',
            'computer': 'CSE',
            'software': 'CSE',
            'ece': 'ECE',
            'electronics': 'ECE',
            'mech': 'MECH',
            'mechanical': 'MECH',
            'eee': 'EEE',
            'electrical': 'EEE',
            'civil': 'CIVIL',
            'common': 'Common',
            '1st year': 'Common',
            'first year': 'Common'
        }
        matched_branch = None
        for key, val in branches.items():
            if key in msg_lower:
                matched_branch = val
                break

        # Check for semester mention (e.g. "3rd sem", "sem 3", "semester 4")
        sem_match = re.search(r'(?:sem|semester)\s*(\d)', msg_lower)
        target_sem = int(sem_match.group(1)) if sem_match else None

        if matched_branch:
            qs = Listing.objects.filter(branch=matched_branch)
            if target_sem:
                qs = qs.filter(semester=target_sem)
            items = qs[:4]
            if items.exists():
                serialized = [
                    {
                        "id": i.id,
                        "title": i.title,
                        "price": str(i.price),
                        "imageUrl": i.imageUrl,
                        "category": i.category,
                        "condition": i.condition,
                        "hostel": i.hostel,
                        "rating": i.rating,
                        "branch": i.branch
                    } for i in items
                ]
                sem_str = f" Semester {target_sem}" if target_sem else ""
                titles_str = "; ".join([f"**{i.title}** (₹{i.price})" for i in items])
                return Response({
                    "reply": f"📚 Found {len(items)} curriculum items for **{matched_branch}{sem_str}**: {titles_str}. All items are available for on-campus handover!",
                    "suggestions": [f"{matched_branch} Books", "Calculators under ₹800", "Show Senior Deals"],
                    "items": serialized
                })

        # -------------------------------------------------------------
        # 5. Specific Product Keywords & Price Filtering
        # -------------------------------------------------------------
        # Price ceiling filter (e.g. "under 500", "under 1000", "below 800")
        price_match = re.search(r'(?:under|below|less than)\s*(?:rs|inr|₹)?\s*(\d+)', msg_lower)
        max_price = float(price_match.group(1)) if price_match else None

        search_tokens = [w for w in cleaned.split() if len(w) >= 3 and w not in {
            'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'want',
            'need', 'show', 'find', 'give', 'tell', 'some', 'looking', 'where',
            'price', 'item', 'items', 'under', 'below'
        }]

        query = Q()
        if search_tokens:
            for t in search_tokens:
                query |= (
                    Q(title__icontains=t) |
                    Q(category__icontains=t) |
                    Q(hostel__icontains=t) |
                    Q(subject_code__icontains=t) |
                    Q(author__icontains=t) |
                    Q(description__icontains=t)
                )

        # Apply category shortcuts
        if 'cycle' in msg_lower or 'bicycle' in msg_lower or 'bike' in msg_lower:
            query |= Q(category='Cycles')
        if 'book' in msg_lower or 'textbook' in msg_lower:
            query |= Q(category='Books')
        if 'calculator' in msg_lower or 'casio' in msg_lower:
            query |= Q(title__icontains='calculator')
        if 'kettle' in msg_lower or 'lamp' in msg_lower or 'pillow' in msg_lower or 'flask' in msg_lower:
            query |= Q(category='Hostel Essentials')

        results = Listing.objects.filter(query)
        if max_price:
            results = results.filter(price__lte=max_price)

        results = results.order_by('-rating')[:4]

        if results.exists():
            serialized = [
                {
                    "id": item.id,
                    "title": item.title,
                    "price": str(item.price),
                    "imageUrl": item.imageUrl,
                    "category": item.category,
                    "condition": item.condition,
                    "hostel": item.hostel,
                    "rating": item.rating,
                    "branch": item.branch
                } for item in results
            ]
            price_clause = f" under ₹{int(max_price)}" if max_price else ""
            summary = "; ".join([f"**{r.title}** (₹{r.price}, {r.condition}, {r.hostel})" for r in results])
            return Response({
                "reply": f"✨ Here are the top matching campus listings{price_clause}:\n\n{summary}\n\nYou can click any card below to view details, inspect condition photos, or add directly to your cart!",
                "suggestions": ["View in Catalog", "Check Senior Deals", "Safe Meetup Spots"],
                "items": serialized
            })

        # -------------------------------------------------------------
        # 6. Friendly Fallback with Smart Guidance
        # -------------------------------------------------------------
        # Fetch 3 popular items for recommendations
        sample_items = Listing.objects.all().order_by('-rating')[:3]
        serialized_sample = [
            {
                "id": s.id,
                "title": s.title,
                "price": str(s.price),
                "imageUrl": s.imageUrl,
                "category": s.category,
                "condition": s.condition,
                "hostel": s.hostel,
                "rating": s.rating,
                "branch": s.branch
            } for s in sample_items
        ]

        return Response({
            "reply": "🤖 I'm here to help you with anything on CampusMart! While I couldn't find an exact match for that specific phrase, here are top campus essentials currently available. You can also try searching by subject code (e.g. *CS201*, *MA101*), item name (e.g. *Hero Sprint cycle*, *Casio FX-991EX*), or ask me about campus meetup points!",
            "suggestions": [
                "🧮 Scientific Calculators",
                "🚲 Bicycles under ₹3000",
                "📚 CSE Core Textbooks",
                "🎓 Senior-Only Deals",
                "📍 Safe Meetup Locations"
            ],
            "items": serialized_sample
        })
