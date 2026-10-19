from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import random

from listings.models import Listing
from cart.models import Cart
from orders.models import Order, OrderItem

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed demo accounts, 54 listings, and optional orders for CampusMart'

    def add_arguments(self, parser):
        parser.add_argument(
            '--with-orders',
            action='store_true',
            help='Generate 6 demo orders spread across the last 7 days',
        )

    def handle(self, *args, **options):
        self.stdout.write("Seeding CampusMart demo accounts...")

        # 1. Create or update Priya (seller)
        priya, created = User.objects.get_or_create(username='Priya')
        priya.set_password('secret123')
        priya.user_type = 'seller'
        priya.email = 'priya@campusmart.edu'
        priya.save()
        Cart.objects.get_or_create(user=priya)

        # 2. Create or update Arjun (student)
        arjun, created = User.objects.get_or_create(username='Arjun')
        arjun.set_password('secret123')
        arjun.user_type = 'student'
        arjun.email = 'arjun@campusmart.edu'
        arjun.save()
        Cart.objects.get_or_create(user=arjun)

        self.stdout.write(self.style.SUCCESS("Demo accounts initialized: Priya (seller) & Arjun (student)"))

        # Seed data configuration
        # Six senior-only deals: 9, 11, 18, 20, 42, 50
        senior_deal_ids = {9, 11, 18, 20, 42, 50}

        books_data = [
            ("Engineering Mathematics Textbook Set", "Hostel C", "Good", True, "450.00", 4.5, 12, "Complete 3-volume set covering Calculus, Linear Algebra, and Differential Equations. Very minimal markings."),
            ("Introduction to Algorithms (CLRS 3rd Ed)", "Hostel A", "Like New", False, "850.00", 4.9, 28, "The bible of algorithms. Pristine condition with dust cover intact."),
            ("Digital Design Principles and Practices", "Hostel B", "Good", True, "380.00", 4.2, 8, "Perfect for ECE and CSE second year courses. Includes CD-ROM companion."),
            ("Organic Chemistry by Morrison & Boyd", "Hostel C", "Fair", True, "290.00", 3.8, 5, "Well referenced with highlighted chapters. Essential for Chem core."),
            ("Operating System Concepts (Silberschatz)", "Hostel D", "Like New", False, "520.00", 4.7, 19, "Dinosaur book for OS course. No torn pages or missing sections."),
            ("Database System Concepts (Korth)", "Hostel A", "Good", True, "420.00", 4.4, 14, "Covers relational algebra, SQL, indexing and transaction processing."),
            ("Physics for Scientists and Engineers", "Hostel C", "Fair", True, "310.00", 4.0, 6, "Foundation physics textbook with worked examples and problem sets."),
            ("Microelectronic Circuits (Sedra & Smith)", "Hostel B", "Like New", False, "690.00", 4.6, 11, "Standard reference for analog circuits and semiconductor devices."),
            ("Engineering Mechanics Statics & Dynamics", "Hostel C", "Like New", False, "350.00", 4.8, 22, "Senior deal! Cleared mechanics with flying colors, pass-along price."),
            ("Computer Networking: A Top-Down Approach", "Hostel D", "Good", True, "480.00", 4.5, 16, "Kurose & Ross 7th edition. Explains TCP/IP stack from application layer down."),
            ("Control Systems Engineering (Norman Nise)", "Hostel A", "Good", True, "390.00", 4.6, 9, "Senior deal! Great textbook for electrical and instrumentation branches."),
            ("Heat and Mass Transfer Fundamentals", "Hostel B", "Fair", True, "260.00", 3.9, 4, "Mechanical engineering 5th semester core textbook."),
            ("Signals and Systems (Oppenheim)", "Hostel C", "Good", False, "430.00", 4.3, 10, "Authoritative text for signal processing and Fourier transforms."),
            ("Python Crash Course & Data Structures Guide", "Hostel A", "Like New", True, "320.00", 4.8, 17, "Handy practical book for coding interviews and campus placements."),
            ("GRE & GATE General Aptitude Preparation Set", "Hostel D", "Good", False, "400.00", 4.4, 13, "Includes previous 10 years question papers with detailed step-by-step solutions.")
        ] # 15 Books (1..15)

        electronics_data = [
            ("Casio FX-991EX ClassWiz Scientific Calculator", "Hostel B", "Like New", False, "850.00", 4.9, 34, "High-resolution display, 552 functions, permitted in all semester exams."),
            ("Boat Rockerz 450 Bluetooth Headphones", "Hostel C", "Good", True, "650.00", 4.3, 15, "15-hour battery life, punchy bass, comes with aux cable and charging wire."),
            ("Arduino Uno R3 Starter Kit with Sensors", "Hostel A", "Like New", False, "750.00", 4.8, 21, "Senior deal! Includes breadboard, jumper wires, ultrasonic sensor, servo and LCD display."),
            ("SanDisk 128GB Ultra Dual USB 3.0 Pen Drive", "Hostel D", "Like New", False, "550.00", 4.7, 18, "Type-C and Type-A dual interface. Blazing fast file transfer for lectures."),
            ("Logitech M330 Silent Wireless Mouse", "Hostel B", "Like New", False, "490.00", 4.9, 29, "Senior deal! 90% noise reduction, ideal for late night study in library steps."),
            ("Ergonomic Laptop Cooling Pad with Dual LED Fans", "Hostel C", "Good", True, "420.00", 4.2, 10, "USB-powered, fits up to 15.6 inch laptops, adjustable height angles."),
            ("TP-Link High Gain USB WiFi Adapter 300Mbps", "Hostel A", "Good", False, "320.00", 4.1, 8, "Strong dual antenna signal reception across hostel corridors."),
            ("Soldering Iron 25W with Stand and Solder Wire", "Hostel B", "Fair", True, "210.00", 3.9, 5, "Handy kit for mini hardware projects and prototyping lab work."),
            ("Anker PowerCore 10000mAh Portable Power Bank", "Hostel C", "Good", True, "790.00", 4.6, 23, "Compact, fast charging, keeps phone alive through back-to-back lectures."),
            ("Philips 4-Socket Surge Protector Extension Board", "Hostel D", "Good", False, "360.00", 4.5, 12, "2-meter heavy duty cable, individual switches with indicator lights."),
            ("Zebronics Mechanical Gaming Keyboard (Blue Switches)", "Hostel A", "Good", True, "950.00", 4.4, 14, "Tactile click feedback, RGB backlight modes, detachable wrist rest."),
            ("Raspberry Pi 4 Model B (4GB RAM) with Case", "Hostel B", "Like New", False, "3200.00", 4.9, 16, "Perfect mini-computer for robotics, Linux servers, and IoT semester projects."),
            ("Portronics Type-C 6-in-1 Multi-Port Hub", "Hostel C", "Like New", True, "890.00", 4.7, 19, "HDMI 4K, 3x USB 3.0, SD card reader, PD 100W pass-through charging."),
            ("Multimeter Digital DT-830D with Probes", "Hostel D", "Good", False, "190.00", 4.0, 7, "Accurately tests voltage, current, resistance and diode continuity.")
        ] # 14 Electronics (16..29)

        essentials_data = [
            ("Prestige 1.5L Stainless Steel Electric Kettle", "Hostel A", "Good", False, "550.00", 4.6, 27, "Must-have hostel companion for midnight tea, noodles, and boiling water."),
            ("Foldable Wooden Bed Table with Cup Holder", "Hostel C", "Like New", True, "390.00", 4.7, 31, "Sturdy anti-slip legs, groove for iPad/phone, ergonomic curved edge."),
            ("Bajaj 1200W Lightweight Dry Iron", "Hostel B", "Good", False, "450.00", 4.3, 14, "Non-stick coated soleplate with thermal fuse safety."),
            ("Rechargeable LED Desk Study Lamp (Touch Dimming)", "Hostel D", "Like New", False, "320.00", 4.8, 22, "3 color temperature modes, flexible 360-degree gooseneck."),
            ("Cloth Drying Stand (Foldable Winged Rack)", "Hostel A", "Good", True, "480.00", 4.2, 9, "Rust-resistant coated steel, folds flat when not in use."),
            ("Wakefit Memory Foam Neck Pillow & Eye Mask", "Hostel C", "Like New", False, "340.00", 4.5, 11, "Super comfortable for dorm sleep and bus journeys home."),
            ("Milton Thermosteel 1000ml Insulated Flask", "Hostel B", "Good", True, "490.00", 4.6, 18, "Keeps water chilled or piping hot for 24 hours continuously."),
            ("Heavy Duty Hostel Door Padlock with 3 Brass Keys", "Hostel D", "Like New", False, "180.00", 4.7, 15, "Hardened steel shackle, pick-resistant brass tumbler mechanism."),
            ("Cello 4-Tier Plastic Storage Modular Rack", "Hostel A", "Good", True, "350.00", 4.1, 8, "Great for organizing textbooks, toiletries, snacks and stationery."),
            ("Mosquito Bat Racket with USB Rechargeable Dock", "Hostel B", "Good", False, "240.00", 4.3, 12, "Triple-layer protective mesh with high-voltage electric zap."),
            ("Full Body Dormitory Mirror with Wall Mount Hooks", "Hostel C", "Good", True, "280.00", 4.0, 7, "Sleek frame, clear reflection, fits on back of closet door."),
            ("Water Immersion Rod 1500W Shock-Proof", "Hostel D", "Good", False, "270.00", 4.4, 10, "Rapid water heating element with safety plastic handle."),
            ("Set of 2 Soft Cotton Pillows with Quilted Covers", "Hostel A", "Like New", False, "250.00", 4.9, 20, "Senior deal! Graduating senior clearing dorm room essentials.")
        ] # 13 Hostel Essentials (30..42)

        cycles_data = [
            ("Hero Sprint 26T Mountain Bicycle (Single Speed)", "Hostel B", "Good", True, "2400.00", 4.4, 18, "Front suspension fork, dual V-brakes, smooth riding across campus grounds."),
            ("Hercules Roadeo Hardliner 21-Speed Gear Cycle", "Hostel A", "Like New", False, "4500.00", 4.8, 24, "Shimano Tourney gears, front disc brake, alloy rims, quick-release seat."),
            ("Avon 24T Unisex Campus Cruiser Cycle", "Hostel C", "Fair", True, "1600.00", 3.9, 12, "Reliable campus commuter with front wire basket and sturdy rear carrier."),
            ("Heavy Duty Steel Combination Cycle Cable Lock", "Hostel D", "Like New", False, "220.00", 4.7, 26, "4-digit resettable code, 1.2m vinyl-coated steel wire rope."),
            ("Bicycle High Pressure Foot Air Pump with Gauge", "Hostel B", "Good", False, "340.00", 4.5, 14, "Universal twin valve for Schrader and Presta tubes."),
            ("LED Rechargeable Bicycle Headlight & Tail Warning Light", "Hostel A", "Like New", False, "280.00", 4.8, 19, "USB rechargeable, waterproof, 3 bright light beam modes."),
            ("Mach City iBike Single Speed Urban Hybrid Cycle", "Hostel C", "Like New", True, "2900.00", 4.9, 25, "Senior deal! Lightweight alloy frame, effortlessly quick on tarmac roads."),
            ("Gel Padded Comfort Bicycle Saddle Cover", "Hostel D", "Like New", False, "190.00", 4.6, 15, "Breathable Lycra surface with shock-absorbing memory foam."),
            ("Bicycle Multi-Tool Repair Kit with Chain Tool & Hex Keys", "Hostel A", "Like New", False, "260.00", 4.7, 13, "16-in-1 compact folding tool for emergency on-the-go maintenance."),
            ("Firefox Target 29T 21-Speed Alloy Mountain Bike", "Hostel B", "Good", True, "5800.00", 4.6, 20, "Zoom suspension with lockout, dual mechanical disc brakes."),
            ("Atlas Ultimate 26T Steel Frame Sturdy Bicycle", "Hostel C", "Good", True, "2100.00", 4.1, 11, "Built like a tank, low maintenance, brand new rear tire fitted last week."),
            ("Bicycle Metal Mudguard Set with Hardware", "Hostel D", "Like New", False, "180.00", 4.3, 8, "Full coverage guards keep hostel clothes clean during rainy monsoon days.")
        ] # 12 Cycles (43..54)

        all_items = []
        for item in books_data:
            all_items.append(('Books', *item))
        for item in electronics_data:
            all_items.append(('Electronics', *item))
        for item in essentials_data:
            all_items.append(('Hostel Essentials', *item))
        for item in cycles_data:
            all_items.append(('Cycles', *item))

        # Total listings: 15 + 14 + 13 + 12 = 54
        assert len(all_items) == 54, f"Expected 54 items, got {len(all_items)}"

        images = [
            "https://picsum.photos/seed/book1/400/400",
            "https://picsum.photos/seed/book2/400/400",
            "https://picsum.photos/seed/elec1/400/400",
            "https://picsum.photos/seed/elec2/400/400",
            "https://picsum.photos/seed/dorm1/400/400",
            "https://picsum.photos/seed/cycle1/400/400",
        ]

        # Academic metadata mapping for Books and Technical items
        academic_meta = {
            1: {"branch": "Common", "semester": 1, "subject_code": "MA101", "author": "Erwin Kreyszig"},
            2: {"branch": "CSE", "semester": 3, "subject_code": "CS201", "author": "Cormen, Leiserson, Rivest, Stein"},
            3: {"branch": "ECE", "semester": 3, "subject_code": "EC202", "author": "John F. Wakerly"},
            4: {"branch": "Common", "semester": 2, "subject_code": "CH101", "author": "Morrison & Boyd"},
            5: {"branch": "CSE", "semester": 4, "subject_code": "CS301", "author": "Silberschatz, Galvin, Gagne"},
            6: {"branch": "CSE", "semester": 4, "subject_code": "CS302", "author": "Silberschatz, Korth, Sudarshan"},
            7: {"branch": "Common", "semester": 1, "subject_code": "PH101", "author": "Serway & Jewett"},
            8: {"branch": "ECE", "semester": 4, "subject_code": "EC301", "author": "Adel S. Sedra, Kenneth C. Smith"},
            9: {"branch": "MECH", "semester": 2, "subject_code": "ME102", "author": "R.C. Hibbeler"},
            10: {"branch": "CSE", "semester": 5, "subject_code": "CS401", "author": "James F. Kurose, Keith W. Ross"},
            11: {"branch": "EEE", "semester": 5, "subject_code": "EE302", "author": "Norman S. Nise"},
            12: {"branch": "MECH", "semester": 5, "subject_code": "ME305", "author": "Yunus A. Cengel"},
            13: {"branch": "ECE", "semester": 3, "subject_code": "EC204", "author": "Alan V. Oppenheim"},
            14: {"branch": "CSE", "semester": 2, "subject_code": "CS102", "author": "Eric Matthes"},
            15: {"branch": "General", "semester": 6, "subject_code": "GE401", "author": "Pearson Education"},
            18: {"branch": "ECE", "semester": 3, "subject_code": "EC251", "author": "Arduino Foundation"},
            27: {"branch": "CSE", "semester": 5, "subject_code": "CS501", "author": "Raspberry Pi Org"},
        }

        self.stdout.write("Syncing 54 listings...")
        for idx, (category, title, hostel, condition, negotiable, price, rating, reviews, desc) in enumerate(all_items, start=1):
            is_senior = (idx in senior_deal_ids)
            img_url = f"https://picsum.photos/seed/listing{idx}/400/400"
            meta = academic_meta.get(idx, {"branch": "General", "semester": 1, "subject_code": "", "author": ""})

            Listing.objects.update_or_create(
                id=idx,
                defaults={
                    'title': title,
                    'hostel': hostel,
                    'condition': condition,
                    'negotiable': negotiable,
                    'category': category,
                    'price': Decimal(price),
                    'imageUrl': img_url,
                    'rating': rating,
                    'total_reviews': reviews,
                    'availability': 'Available',
                    'is_senior_deal': is_senior,
                    'description': desc,
                    'branch': meta['branch'],
                    'semester': meta['semester'],
                    'subject_code': meta['subject_code'],
                    'author': meta['author'],
                    'seller': priya
                }
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded 54 listings! (Senior-Only deals: {sorted(list(senior_deal_ids))})"))

        # Optional --with-orders argument
        if options.get('with_orders'):
            self.stdout.write("Generating demo orders for the last 7 days...")
            meetup_choices = ['LIBRARY', 'MAIN_GATE', 'CANTEEN']
            now = timezone.now()

            # Clean existing demo orders
            Order.objects.filter(user=arjun).delete()

            order_configs = [
                (6, 'delivered', 'LIBRARY', 1, [1, 16]),
                (5, 'delivered', 'MAIN_GATE', 2, [30]),
                (4, 'delivered', 'CANTEEN', 3, [43]),
                (3, 'shipped', 'LIBRARY', 1, [2, 17]),
                (2, 'placed', 'CANTEEN', 2, [5]),
                (1, 'placed', 'MAIN_GATE', 1, [31, 44]),
            ]

            for days_ago, st, meetup, qty, listing_ids in order_configs:
                order_date = now - timedelta(days=days_ago)
                total = Decimal('0.00')

                order = Order.objects.create(
                    user=arjun,
                    payment_method='COD',
                    meetup_point=meetup,
                    address={
                        "full_name": "Arjun Kumar",
                        "phone": "9876543210",
                        "address": "Room 312, Hostel D",
                        "city": "Hyderabad",
                        "state": "Telangana",
                        "pincode": "500001"
                    },
                    total_price=Decimal('0.00'),
                    status=st,
                    is_paid=(st == 'delivered'),
                )
                order.created_at = order_date

                for lid in listing_ids:
                    l = Listing.objects.get(id=lid)
                    row_amount = l.price * qty
                    total += row_amount
                    item = OrderItem.objects.create(
                        order=order,
                        listing=l,
                        seller=l.seller,
                        title=l.title,
                        hostel=l.hostel,
                        condition=l.condition,
                        imageUrl=l.imageUrl,
                        price=l.price,
                        quantity=qty,
                        status=st
                    )

                order.total_price = total
                order.save()

            self.stdout.write(self.style.SUCCESS("Generated 6 demo orders spread across the last 7 days!"))
