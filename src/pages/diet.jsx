import Head from 'next/head'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function ToolsSection({ children, ...props }) {
  return (
    <Section {...props}>
      <ul role="list" className="space-y-16">
        {children}
      </ul>
    </Section>
  )
}

function Tool({ title, href, children }) {
  return (
    <Card as="li">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Description>{children}</Card.Description>
    </Card>
  )
}

export default function Diet() {
  return (
    <>
      <Head>
        <title>Tools & Recommendations - Lorenzo Scaturchio</title>
        <meta
          name="description"
          content="All of the meals that I currently have on a bi-weekly basis"
        />
      </Head>
      <SimpleLayout
        title="My Current Plant-Based Diet"
        intro="This bi-weekly plan provides a balanced and varied diet, focusing on whole grains, legumes, vegetables, fruits, nuts, and seeds to ensure a comprehensive nutrient intake. Feel free to swap meals according to personal preference or seasonal availability of ingredients."
      >
        <div className="space-y-20">
          <ToolsSection title="Week 1">
            <Tool title="Monday">
                Breakfast: Oatmeal topped with fresh berries, flaxseeds, and a drizzle of maple syrup.
                Lunch: Quinoa salad with black beans, corn, avocado, tomatoes, and a lime-cilantro dressing.
                Dinner: Lentil soup with carrots, tomatoes, and kale served with whole grain bread.
            </Tool>
            <Tool title="Tuesday">
                Breakfast: Smoothie bowl with spinach, banana, almond milk, topped with granola and sliced almonds.
                Lunch: Chickpea and vegetable stir-fry served over brown rice.
                Dinner: Stuffed bell peppers with a mixture of wild rice, mushrooms, walnuts, and spices.
            </Tool>
            <Tool title="Wednesday">
                Breakfast: Avocado toast on whole grain bread with sliced tomatoes and a sprinkle of hemp seeds.
                Lunch: Butternut squash soup with a side of mixed greens salad.
                Dinner: Spaghetti with marinara sauce, lentil meatballs, and a side of roasted broccoli.
            </Tool>
            <Tool title="Thursday">
                Breakfast: Chia pudding made with coconut milk and topped with mixed berries and a sprinkle of coconut flakes.
                Lunch: Falafel wrap with hummus, cucumber, lettuce, and tomato in a whole grain pita.
                Dinner: Vegan chili with kidney beans, black beans, quinoa, and vegetables, topped with avocado and cilantro.
            </Tool>
            <Tool title="Friday">
                Breakfast: Peanut butter and banana sandwich on whole grain bread.
                Lunch: Sweet potato and black bean burrito bowls with rice, salsa, and guacamole.
                Dinner: Eggplant parmesan made with cashew cheese, served with a side of Caesar salad using a vegan dressing.
            </Tool>
            <Tool title="Saturday">
                Breakfast: Muesli with almond milk, topped with diced apple and cinnamon.
                Lunch: Vegan sushi rolls with avocado, cucumber, carrot, and tofu, served with miso soup.
                Dinner: Vegetable curry with chickpeas served over jasmine rice.
            </Tool>
            <Tool title="Sunday">
                Breakfast: Pancakes made with oat flour, served with fresh fruit and a dollop of coconut yogurt.
                Lunch: Mediterranean quinoa salad with lemon-tahini dressing.
                Dinner: Vegan pizza with a cauliflower crust, tomato sauce, a variety of vegetables, and nutritional yeast for topping.
            </Tool>
          </ToolsSection>
          <ToolsSection title="Week 2">
            <Tool title="Monday">
                Breakfast: Breakfast tacos with scrambled tofu, black beans, avocado, and salsa.
                Lunch: Roasted beet and citrus salad with a balsamic vinaigrette.
                Dinner: Vegan shepherd's pie with lentils, peas, carrots, and a mashed potato topping.
            </Tool>
            <Tool title="Tuesday">
                Breakfast: Green smoothie with spinach, pineapple, mango, and plant-based protein powder.
                Lunch: Vegan lentil loaf with a side of mashed sweet potatoes and green beans.
                Dinner: Thai peanut noodle salad with edamame, bell peppers, and cilantro.
            </Tool>
            <Tool title="Wednesday">
                Breakfast: Almond butter and jelly on sprouted grain bread.
                Lunch: Stuffed acorn squash with wild rice, cranberries, pecans, and a drizzle of maple syrup.
                Dinner: Vegan paella with saffron rice, artichokes, bell peppers, peas, and olives.
            </Tool>
            <Tool title="Thursday">
                Breakfast: Coconut yogurt parfait with granola and tropical fruit (mango, pineapple, kiwi).
                Lunch: Grilled portobello mushroom burgers on whole grain buns with lettuce, tomato, and avocado.
                Dinner: Vegan mac and cheese with a side of steamed broccoli.
            </Tool>
            <Tool title="Friday">
                Breakfast: Berry and kale smoothie with almond butter and oat milk.
                Lunch: Arugula salad with roasted pumpkin, pomegranate seeds, and pecans, dressed with olive oil and lemon.
                Dinner: Stir-fried tofu with vegetables in a ginger-soy sauce served over quinoa.
            </Tool>
            <Tool title="Saturday">
                Breakfast: Vegan banana nut muffins and a side of fruit salad.
                Lunch: Cold rice noodle salad with tofu, cucumber, carrots, and a spicy peanut dressing.
                Dinner: Black bean and sweet potato enchiladas with a side of Mexican-style quinoa.
            </Tool>
            <Tool title="Sunday">
                Breakfast: Fruit salad with a lime and mint dressing.
                Lunch: Vegan Caesar salad with chickpea croutons and avocado slices.
                Dinner: Stuffed zucchini boats with a mixture of bulgur, cherry tomatoes, pine nuts, and herbs, served with a side of roasted asparagus.
            </Tool>
          </ToolsSection>
        </div>
      </SimpleLayout>
    </>
  )
}
