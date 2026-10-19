from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q
from listings.models import Listing
from orders.models import Order

class CampusChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '').strip().lower()
        if not user_message:
            return Response({"reply": "Hi there! I am your CampusMart AI Assistant. How can I help you today? You can ask about textbooks, electronics, cycles, senior deals, orders, or campus meetup points!"})

        # Contextual AI intelligence based on database
        if any(w in user_message for w in ['senior', 'senior deal', 'seniordeal', 'graduation']):
            deals = Listing.objects.filter(is_senior_deal=True)[:4]
            deal_titles = ", ".join([f"'{d.title}' (₹{d.price})" for d in deals])
            return Response({
                "reply": f"🎓 Senior-Only Deals are heavily discounted items posted by graduating seniors clearing their dorms! Only signed-in campus members can view and grab them. Some hot senior deals right now include: {deal_titles}.",
                "suggestions": ["Show Senior Deals", "How to become a seller?", "Calculators under ₹800"]
            })

        if any(w in user_message for w in ['calculator', 'casio', 'math']):
            items = Listing.objects.filter(Q(title__icontains='calculator') | Q(title__icontains='mathematics'))[:3]
            if items.exists():
                details = "; ".join([f"{item.title} at ₹{item.price} ({item.condition}, {item.hostel})" for item in items])
                return Response({
                    "reply": f"Found these matching tools: {details}. You can add them straight to your cart!",
                    "suggestions": ["Casio ClassWiz", "Math Textbook Set", "Go to Cart"]
                })

        if any(w in user_message for w in ['cycle', 'bicycle', 'bike']):
            cycles = Listing.objects.filter(category='Cycles')[:3]
            details = "; ".join([f"{c.title} for ₹{c.price} in {c.hostel}" for c in cycles])
            return Response({
                "reply": f"🚲 Here are available campus cycles: {details}. Meetup can be arranged right at your hostel gate!",
                "suggestions": ["Hero Sprint", "Gear Cycles", "Hostel Essentials"]
            })

        if any(w in user_message for w in ['meetup', 'library', 'gate', 'canteen']):
            return Response({
                "reply": "📍 CampusMart uses 3 verified safe campus meetup points: Library Steps, Main Gate, and Canteen. When a seller marks an order 'Shipped', they are heading to your selected meetup point to hand over the item!",
                "suggestions": ["Where is my order?", "Browse all listings", "Cash on Delivery"]
            })

        if any(w in user_message for w in ['shipped', 'delivered', 'placed', 'cancel', 'status']):
            return Response({
                "reply": "📦 Orders pass through 4 clear stages: 'Placed' (order created, cancellable by buyer), 'Shipped' (seller en route to meetup spot), 'Delivered' (handed over and paid), and 'Cancelled'. If you're a buyer, check 'My Orders' to see live status updates!",
                "suggestions": ["Check My Orders", "Meetup Points", "Seller Dashboard"]
            })

        # Academic Branch & Semester queries (CSE, ECE, MECH, EEE, CIVIL, 1st-8th Sem)
        branches = ['cse', 'ece', 'mech', 'eee', 'civil', 'common']
        matched_branch = next((b for b in branches if b in user_message), None)
        if matched_branch:
            branch_key = matched_branch.upper() if matched_branch != 'common' else 'Common'
            items = Listing.objects.filter(branch=branch_key)[:4]
            if items.exists():
                details = "; ".join([f"{i.title} (Sem {i.semester}, ₹{i.price})" for i in items])
                return Response({
                    "reply": f"📚 Found {branch_key} curriculum items: {details}. You can filter directly by {branch_key} in the catalog!",
                    "suggestions": [f"{branch_key} Semester 3", "Engineering Books", "Senior Deals"]
                })

        # Search matching listings by query tokens (including subject_code, author, branch, title, category)
        tokens = [t for t in user_message.split() if len(t) > 2]
        query = Q()
        for t in tokens:
            query |= (
                Q(title__icontains=t) |
                Q(category__icontains=t) |
                Q(hostel__icontains=t) |
                Q(subject_code__icontains=t) |
                Q(author__icontains=t) |
                Q(branch__icontains=t)
            )

        matched = Listing.objects.filter(query)[:3]
        if matched.exists():
            details = "; ".join([f"'{m.title}' (₹{m.price}, {m.hostel}, {m.branch})" for m in matched])
            return Response({
                "reply": f"✨ I found listings matching your search: {details}. Click on listings to view condition and add to cart!",
                "suggestions": ["View Listings", "Senior Deals", "Contact Seller"]
            })

        return Response({
            "reply": "🤖 I'm your 24/7 CampusMart AI! I can help you search items (e.g. 'CSE textbooks', 'Casio calculator', 'Hostel C cycle', 'Cormen algorithms'), explain Senior Deals, explain meetup locations, or guide you on buying and selling on campus. What are you looking for?",
            "suggestions": ["CSE 3rd Sem Books", "Show Senior Deals", "Campus Meetup Points", "Calculators under ₹800"]
        })

